from __future__ import annotations

import uuid
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy import func, or_
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models import (
    AuditLog,
    Cotizacion,
    CotizacionItem,
    Product,
    ProductVariant,
    RoleEnum,
    StatusCotizacionEnum,
    User,
)
from app.rut_validador import normalizar_rut, validar_rut_chileno
from app.schemas import (
    CotizacionCreate,
    CotizacionListResponse,
    CotizacionResponse,
    CotizacionStatusUpdate,
    MensajeResponse,
)
from app.security import get_current_user, get_optional_user, require_roles

router = APIRouter(prefix="/api/cotizaciones", tags=["Cotizaciones"])

IVA = 0.19
StaffDep = require_roles(RoleEnum.ADMIN, RoleEnum.VENDEDOR)


def _serializar(cot: Cotizacion) -> CotizacionResponse:
    return CotizacionResponse(
        id=cot.id,
        folio=cot.folio,
        user_id=cot.user_id,
        rut=cot.rut,
        nombre_contacto=cot.nombre_contacto,
        email=cot.email,
        telefono=cot.telefono,
        empresa=cot.empresa,
        direccion=cot.direccion,
        comentarios=cot.comentarios,
        total_neto=cot.total_neto,
        iva=cot.iva,
        total_total=cot.total_total,
        estado=cot.estado,
        created_at=cot.created_at,
        items=cot.items,
    )


@router.post("", response_model=CotizacionResponse, status_code=201)
def crear_cotizacion(
    data: CotizacionCreate,
    request: Request,
    db: Session = Depends(get_db),
    user: Optional[User] = Depends(get_optional_user),
):
    """Crea una solicitud de cotización. Funciona con o sin sesión iniciada."""
    if data.rut and not validar_rut_chileno(data.rut):
        raise HTTPException(status_code=400, detail="El RUT ingresado no es válido para Chile.")

    total_neto = 0
    items: list[CotizacionItem] = []

    for item in data.items:
        producto: Product | None = None
        variante: ProductVariant | None = None

        if item.variant_id:
            variante = (
                db.query(ProductVariant)
                .options(joinedload(ProductVariant.product))
                .filter(ProductVariant.id == item.variant_id, ProductVariant.activo.is_(True))
                .first()
            )
            if not variante:
                raise HTTPException(status_code=404, detail="Una de las medidas seleccionadas ya no está disponible.")
            producto = variante.product
        elif item.product_id:
            producto = db.query(Product).filter(Product.id == item.product_id).first()
            if not producto:
                raise HTTPException(status_code=404, detail="Uno de los productos ya no está disponible.")
            variante = next((v for v in producto.variantes if v.activo), None)

        if not producto:
            raise HTTPException(status_code=400, detail="Cada ítem debe indicar product_id o variant_id.")

        precio = variante.precio if variante else producto.precio_base
        subtotal = precio * item.cantidad
        total_neto += subtotal

        items.append(
            CotizacionItem(
                id=str(uuid.uuid4()),
                product_id=producto.id,
                variant_id=variante.id if variante else None,
                nombre_producto=producto.nombre,
                medida=variante.medida if variante else None,
                unidad=variante.unidad if variante else producto.unidad,
                cantidad=item.cantidad,
                precio_unitario=precio,
                subtotal=subtotal,
            )
        )

    iva = int(round(total_neto * IVA))
    ultimo_folio = db.query(func.max(Cotizacion.folio)).scalar() or 1000

    cotizacion = Cotizacion(
        id=str(uuid.uuid4()),
        folio=ultimo_folio + 1,
        user_id=user.id if user else None,
        rut=normalizar_rut(data.rut) if data.rut else None,
        nombre_contacto=data.nombre.strip(),
        email=str(data.email).lower(),
        telefono=data.telefono,
        empresa=data.empresa,
        direccion=data.direccion,
        comentarios=data.comentarios,
        total_neto=total_neto,
        iva=iva,
        total_total=total_neto + iva,
        estado=StatusCotizacionEnum.PENDIENTE,
    )
    cotizacion.items = items
    db.add(cotizacion)

    db.add(
        AuditLog(
            id=str(uuid.uuid4()),
            user_id=user.id if user else None,
            accion="CREAR_COTIZACION",
            detalles=f"Folio {cotizacion.folio} · {len(items)} ítem(s) · Total {cotizacion.total_total}",
            ip_address=request.client.host if request.client else "127.0.0.1",
        )
    )
    db.commit()
    db.refresh(cotizacion)

    return _serializar(cotizacion)


@router.get("/mias", response_model=CotizacionListResponse)
def mis_cotizaciones(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    cotizaciones = (
        db.query(Cotizacion)
        .options(joinedload(Cotizacion.items))
        .filter(Cotizacion.user_id == user.id)
        .order_by(Cotizacion.created_at.desc())
        .all()
    )
    return CotizacionListResponse(total=len(cotizaciones), items=[_serializar(c) for c in cotizaciones])


@router.get("", response_model=CotizacionListResponse)
def listar_cotizaciones(
    estado: Optional[StatusCotizacionEnum] = None,
    q: Optional[str] = None,
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    _: User = Depends(StaffDep),
    db: Session = Depends(get_db),
):
    query = db.query(Cotizacion).options(joinedload(Cotizacion.items))
    if estado:
        query = query.filter(Cotizacion.estado == estado)
    if q:
        texto = f"%{q.strip()}%"
        query = query.filter(
            or_(
                Cotizacion.nombre_contacto.ilike(texto),
                Cotizacion.email.ilike(texto),
                Cotizacion.empresa.ilike(texto),
                Cotizacion.rut.ilike(texto),
            )
        )

    total = query.count()
    cotizaciones = query.order_by(Cotizacion.created_at.desc()).offset(offset).limit(limit).all()
    return CotizacionListResponse(total=total, items=[_serializar(c) for c in cotizaciones])


@router.get("/{cotizacion_id}", response_model=CotizacionResponse)
def obtener_cotizacion(
    cotizacion_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    cot = (
        db.query(Cotizacion)
        .options(joinedload(Cotizacion.items))
        .filter(Cotizacion.id == cotizacion_id)
        .first()
    )
    if not cot:
        raise HTTPException(status_code=404, detail="Cotización no encontrada.")
    if user.role not in (RoleEnum.ADMIN, RoleEnum.VENDEDOR) and cot.user_id != user.id:
        raise HTTPException(status_code=403, detail="No tienes acceso a esta cotización.")
    return _serializar(cot)


@router.patch("/{cotizacion_id}/estado", response_model=CotizacionResponse)
def actualizar_estado(
    cotizacion_id: str,
    data: CotizacionStatusUpdate,
    _: User = Depends(StaffDep),
    db: Session = Depends(get_db),
):
    cot = (
        db.query(Cotizacion)
        .options(joinedload(Cotizacion.items))
        .filter(Cotizacion.id == cotizacion_id)
        .first()
    )
    if not cot:
        raise HTTPException(status_code=404, detail="Cotización no encontrada.")
    cot.estado = data.estado
    db.commit()
    db.refresh(cot)
    return _serializar(cot)


@router.delete("/{cotizacion_id}", response_model=MensajeResponse)
def eliminar_cotizacion(
    cotizacion_id: str,
    _: User = Depends(require_roles(RoleEnum.ADMIN)),
    db: Session = Depends(get_db),
):
    cot = db.query(Cotizacion).filter(Cotizacion.id == cotizacion_id).first()
    if not cot:
        raise HTTPException(status_code=404, detail="Cotización no encontrada.")
    db.delete(cot)
    db.commit()
    return MensajeResponse(mensaje="Cotización eliminada.")
