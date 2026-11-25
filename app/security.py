"""Utilidades de seguridad: hash de contraseñas, JWT y dependencias de Auth."""
from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Iterable, Optional

import bcrypt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.config import (
    ACCESS_TOKEN_EXPIRE_DAYS_REMEMBER,
    ACCESS_TOKEN_EXPIRE_MINUTES,
    ALGORITHM,
    SECRET_KEY,
)
from app.database import get_db
from app.models import RoleEnum, User

pwd_context = None
bearer_scheme = HTTPBearer(auto_error=False)


def _password_bytes(password: str) -> bytes:
    # bcrypt sólo considera los primeros 72 bytes; truncamos de forma explícita.
    return password.encode("utf-8")[:72]


def hash_password(password: str) -> str:
    return bcrypt.hashpw(_password_bytes(password), bcrypt.gensalt(rounds=12)).decode("utf-8")


def verify_password(plain: str, hashed: Optional[str]) -> bool:
    if not hashed:
        return False
    try:
        return bcrypt.checkpw(_password_bytes(plain), hashed.encode("utf-8"))
    except (ValueError, TypeError):
        return False


def create_access_token(user: User, remember: bool = False) -> str:
    if remember:
        expires = timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS_REMEMBER)
    else:
        expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {
        "sub": user.id,
        "email": user.email,
        "role": user.role.value if isinstance(user.role, RoleEnum) else str(user.role),
        "exp": datetime.now(timezone.utc) + expires,
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Sesión inválida o expirada. Vuelve a iniciar sesión.",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc


def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No se enviaron credenciales de autenticación.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    payload = decode_token(credentials.credentials)
    user = db.query(User).filter(User.id == payload.get("sub")).first()
    if user is None:
        raise HTTPException(status_code=401, detail="Usuario no encontrado.")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Tu cuenta está deshabilitada. Contacta a un administrador.")
    return user


def get_optional_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> Optional[User]:
    if credentials is None:
        return None
    try:
        payload = decode_token(credentials.credentials)
    except HTTPException:
        return None
    return db.query(User).filter(User.id == payload.get("sub")).first()


def require_roles(*roles: Iterable[RoleEnum]):
    permitidos = set(roles)

    def dependency(user: User = Depends(get_current_user)) -> User:
        if user.role not in permitidos:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tienes permisos para realizar esta acción.",
            )
        return user

    return dependency
