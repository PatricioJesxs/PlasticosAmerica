from __future__ import annotations

import json
import uuid
from datetime import datetime
from urllib.parse import quote
from urllib.request import urlopen

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.config import GOOGLE_CLIENT_ID
from app.database import get_db
from app.models import AuditLog, AuthProviderEnum, RoleEnum, User
from app.rut_validador import formatear_rut, normalizar_rut, validar_rut_chileno
from app.schemas import (
    GoogleLoginRequest,
    LoginRequest,
    PasswordChange,
    TokenResponse,
    UserAdminCreate,
    UserAdminUpdate,
    UserCreate,
    UserResponse,
    UserUpdate,
)
from app.security import (
    create_access_token,
    get_current_user,
    hash_password,
    require_roles,
    verify_password,
)

router = APIRouter(prefix="/api/auth", tags=["Autenticación"])


# --------------------------------------------------------------------------
# Helpers
# --------------------------------------------------------------------------
def _buscar_por_identificador(db: Session, identificador: str) -> User | None:
    identificador = (identificador or "").strip()
    correo = identificador.lower()
    user = db.query(User).filter(User.email == correo).first()
    if user:
        return user
    rut_normal = normalizar_rut(identificador)
    if rut_normal and len(rut_normal) >= 9:
        user = db.query(User).filter(User.rut == rut_normal).first()
        if user:
            return user
        user = db.query(User).filter(User.rut == formatear_rut(identificador)).first()
    return user


def _registrar_auditoria(db: Session, user: User | None, accion: str, detalles: str, request: Request | None = None):
    db.add(
        AuditLog(
            id=str(uuid.uuid4()),
            user_id=user.id if user else None,
            accion=accion,
            detalles=detalles,
            ip_address=(request.client.host if request and request.client else "127.0.0.1"),
        )
    )


def _validar_unicos(db: Session, email: str, rut: str | None, excluir_id: str | None = None):
    q_email = db.query(User).filter(User.email == email.lower())
    if excluir_id:
        q_email = q_email.filter(User.id != excluir_id)
    if q_email.first():
        raise HTTPException(status_code=409, detail="Ya existe una cuenta registrada con ese correo.")

    if rut:
        rut_normal = normalizar_rut(rut)
        q_rut = db.query(User).filter(User.rut == rut_normal)
        if excluir_id:
            q_rut = q_rut.filter(User.id != excluir_id)
        if q_rut.first():
            raise HTTPException(status_code=409, detail="Ya existe una cuenta registrada con ese RUT.")


# --------------------------------------------------------------------------
# Registro e inicio de sesión
# --------------------------------------------------------------------------
@router.post("/registro", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def registrar_usuario(data: UserCreate, request: Request, db: Session = Depends(get_db)):
    email = str(data.email).lower().strip()
    rut = formatear_rut(data.rut) if data.rut else None

    if rut and not validar_rut_chileno(rut):
        raise HTTPException(status_code=400, detail="El RUT ingresado no es válido para Chile.")

    _validar_unicos(db, email, normalizar_rut(rut) if rut else None)

    user = User(
        id=str(uuid.uuid4()),
        rut=normalizar_rut(rut) if rut else None,
        nombre=data.nombre.strip(),
        email=email,
        telefono=(data.telefono or "").strip() or None,
        hashed_password=hash_password(data.password),
        role=RoleEnum.CLIENTE,
        auth_provider=AuthProviderEnum.LOCAL,
        is_active=True,
        created_at=datetime.utcnow(),
        last_login=datetime.utcnow(),
    )
    db.add(user)
    _registrar_auditoria(db, user, "REGISTRO_USUARIO", f"Cuenta creada: {email}", request)
    db.commit()
    db.refresh(user)

    return TokenResponse(access_token=create_access_token(user), user=UserResponse.model_validate(user))


@router.post("/login", response_model=TokenResponse)
def iniciar_sesion(data: LoginRequest, request: Request, db: Session = Depends(get_db)):
    user = _buscar_por_identificador(db, data.email)

    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Correo/RUT o contraseña incorrectos.")

    if not user.is_active:
        raise HTTPException(status_code=403, detail="Tu cuenta está deshabilitada. Contacta a un administrador.")

    user.last_login = datetime.utcnow()
    _registrar_auditoria(db, user, "LOGIN", f"Inicio de sesión: {user.email}", request)
    db.commit()
    db.refresh(user)

    return TokenResponse(
        access_token=create_access_token(user, remember=data.remember),
        user=UserResponse.model_validate(user),
    )


@router.post("/google", response_model=TokenResponse)
def iniciar_sesion_google(data: GoogleLoginRequest, request: Request, db: Session = Depends(get_db)):
    """Valida el ID token de Google Identity Services y crea/inicia la cuenta."""
    try:
        with urlopen(
            "https://oauth2.googleapis.com/tokeninfo?id_token=" + quote(data.credential),
            timeout=10,
        ) as response:
            info = json.loads(response.read().decode("utf-8"))
    except Exception as exc:
        raise HTTPException(status_code=401, detail="No se pudo validar la cuenta de Google.") from exc

    if GOOGLE_CLIENT_ID and info.get("aud") != GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=401, detail="La credencial de Google no corresponde a esta aplicación.")

    if str(info.get("email_verified", "false")).lower() != "true":
        raise HTTPException(status_code=401, detail="Google no ha verificado este correo.")

    email = (info.get("email") or "").lower()
    google_id = info.get("sub")
    if not email or not google_id:
        raise HTTPException(status_code=401, detail="La cuenta de Google no entregó los datos necesarios.")

    user = db.query(User).filter(User.google_id == google_id).first()
    if not user:
        user = db.query(User).filter(User.email == email).first()
    if user:
        user.google_id = google_id
        user.auth_provider = AuthProviderEnum.GOOGLE
        user.avatar_url = info.get("picture") or user.avatar_url
        user.last_login = datetime.utcnow()
        if not user.nombre and info.get("name"):
            user.nombre = info["name"]
    else:
        user = User(
            id=str(uuid.uuid4()),
            rut=None,
            nombre=info.get("name") or email.split("@")[0],
            email=email,
            telefono=None,
            hashed_password=None,
            role=RoleEnum.CLIENTE,
            auth_provider=AuthProviderEnum.GOOGLE,
            google_id=google_id,
            avatar_url=info.get("picture"),
            is_active=True,
            created_at=datetime.utcnow(),
            last_login=datetime.utcnow(),
        )
        db.add(user)

    if not user.is_active:
        raise HTTPException(status_code=403, detail="Tu cuenta está deshabilitada. Contacta a un administrador.")

    _registrar_auditoria(db, user, "LOGIN_GOOGLE", f"Inicio de sesión con Google: {email}", request)
    db.commit()
    db.refresh(user)

    return TokenResponse(access_token=create_access_token(user, remember=True), user=UserResponse.model_validate(user))


# --------------------------------------------------------------------------
# Perfil propio
# --------------------------------------------------------------------------
@router.get("/me", response_model=UserResponse)
def mi_perfil(user: User = Depends(get_current_user)):
    return user


@router.put("/me", response_model=UserResponse)
def actualizar_perfil(
    data: UserUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if data.email and data.email.lower() != user.email:
        _validar_unicos(db, str(data.email).lower(), None, excluir_id=user.id)
        user.email = str(data.email).lower()

    if data.nombre is not None:
        user.nombre = data.nombre.strip()
    if data.telefono is not None:
        user.telefono = data.telefono.strip() or None
    if data.rut is not None:
        if not validar_rut_chileno(data.rut):
            raise HTTPException(status_code=400, detail="El RUT ingresado no es válido para Chile.")
        rut_normal = normalizar_rut(data.rut)
        _validar_unicos(db, user.email, rut_normal, excluir_id=user.id)
        user.rut = rut_normal

    db.commit()
    db.refresh(user)
    return user


@router.post("/me/password", status_code=204)
def cambiar_password(
    data: PasswordChange,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if user.hashed_password and not verify_password(data.password_actual, user.hashed_password):
        raise HTTPException(status_code=400, detail="La contraseña actual no es correcta.")
    user.hashed_password = hash_password(data.password_nueva)
    db.commit()
    return None


# --------------------------------------------------------------------------
# Administración de usuarios
# --------------------------------------------------------------------------
@router.get("/usuarios", response_model=list[UserResponse])
def listar_usuarios(
    q: str | None = None,
    _: User = Depends(require_roles(RoleEnum.ADMIN)),
    db: Session = Depends(get_db),
):
    query = db.query(User)
    if q:
        like = f"%{q.strip().lower()}%"
        query = query.filter(
            (User.nombre.ilike(like)) | (User.email.ilike(like)) | (User.rut.ilike(like))
        )
    return query.order_by(User.created_at.desc()).all()


@router.post("/usuarios", response_model=UserResponse, status_code=201)
def crear_usuario_interno(
    data: UserAdminCreate,
    request: Request,
    admin: User = Depends(require_roles(RoleEnum.ADMIN)),
    db: Session = Depends(get_db),
):
    email = str(data.email).lower().strip()
    rut = formatear_rut(data.rut) if data.rut else None
    if rut and not validar_rut_chileno(rut):
        raise HTTPException(status_code=400, detail="El RUT ingresado no es válido para Chile.")
    _validar_unicos(db, email, normalizar_rut(rut) if rut else None)

    user = User(
        id=str(uuid.uuid4()),
        rut=normalizar_rut(rut) if rut else None,
        nombre=data.nombre.strip(),
        email=email,
        telefono=(data.telefono or "").strip() or None,
        hashed_password=hash_password(data.password),
        role=data.role,
        auth_provider=AuthProviderEnum.LOCAL,
        is_active=True,
        created_at=datetime.utcnow(),
    )
    db.add(user)
    _registrar_auditoria(db, admin, "CREAR_USUARIO_INTERNO", f"{email} con rol {data.role.value}", request)
    db.commit()
    db.refresh(user)
    return user


@router.patch("/usuarios/{user_id}", response_model=UserResponse)
def actualizar_usuario(
    user_id: str,
    data: UserAdminUpdate,
    request: Request,
    admin: User = Depends(require_roles(RoleEnum.ADMIN)),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado.")
    if user.id == admin.id and data.is_active is False:
        raise HTTPException(status_code=400, detail="No puedes deshabilitar tu propia cuenta.")
    if user.id == admin.id and data.role and data.role != RoleEnum.ADMIN:
        raise HTTPException(status_code=400, detail="No puedes quitarte el rol de administrador.")

    cambios = []
    if data.role is not None:
        user.role = data.role
        cambios.append(f"rol={data.role.value}")
    if data.is_active is not None:
        user.is_active = data.is_active
        cambios.append(f"activo={data.is_active}")

    _registrar_auditoria(db, admin, "ACTUALIZAR_USUARIO", f"{user.email}: {', '.join(cambios) or 'sin cambios'}", request)
    db.commit()
    db.refresh(user)
    return user


@router.get("/auditoria")
def auditoria(
    limite: int = 100,
    _: User = Depends(require_roles(RoleEnum.ADMIN)),
    db: Session = Depends(get_db),
):
    logs = db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(min(limite, 500)).all()
    return [
        {
            "id": log.id,
            "user_id": log.user_id,
            "accion": log.accion,
            "detalles": log.detalles,
            "ip_address": log.ip_address,
            "timestamp": log.timestamp,
        }
        for log in logs
    ]
