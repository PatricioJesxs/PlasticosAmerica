from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models import Category, Cotizacion, Product, RoleEnum, StatusCotizacionEnum, User
from app.schemas import AdminStats, CotizacionResponse
from app.security import require_roles

router = APIRouter(prefix="/api/admin", tags=["Panel de administración"])


@router.get("/stats", response_model=AdminStats)
def estadisticas(
    _: User = Depends(require_roles(RoleEnum.ADMIN, RoleEnum.VENDEDOR)),
    db: Session = Depends(get_db),
):
    total_cotizaciones = db.query(func.count(Cotizacion.id)).scalar() or 0
    pendientes = (
        db.query(func.count(Cotizacion.id))
        .filter(Cotizacion.estado.in_([StatusCotizacionEnum.PENDIENTE, StatusCotizacionEnum.EN_REVISION]))
        .scalar()
        or 0
    )
    ventas = db.query(func.coalesce(func.sum(Cotizacion.total_total), 0)).scalar() or 0

    ultimas = (
        db.query(Cotizacion)
        .options(joinedload(Cotizacion.items))
        .order_by(Cotizacion.created_at.desc())
        .limit(6)
        .all()
    )

    return AdminStats(
        productos=db.query(func.count(Product.id)).filter(Product.activo.is_(True)).scalar() or 0,
        categorias=db.query(func.count(Category.id)).scalar() or 0,
        cotizaciones=total_cotizaciones,
        cotizaciones_pendientes=pendientes,
        usuarios=db.query(func.count(User.id)).scalar() or 0,
        ventas_cotizadas=int(ventas),
        ultimas_cotizaciones=[
            CotizacionResponse(
                id=c.id,
                folio=c.folio,
                user_id=c.user_id,
                rut=c.rut,
                nombre_contacto=c.nombre_contacto,
                email=c.email,
                telefono=c.telefono,
                empresa=c.empresa,
                direccion=c.direccion,
                comentarios=c.comentarios,
                total_neto=c.total_neto,
                iva=c.iva,
                total_total=c.total_total,
                estado=c.estado,
                created_at=c.created_at,
                items=c.items,
            )
            for c in ultimas
        ],
    )
