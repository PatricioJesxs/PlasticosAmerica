"""Carga inicial del catÃ¡logo y del usuario administrador.

Uso:
    python -m app.seed

El catÃ¡logo se lee desde app/data/catalogo.json, generado a partir del
catÃ¡logo comercial de PlÃ¡sticos AmÃ©rica. Los precios incluidos son de
demostraciÃ³n y deben ajustarse desde el panel de administraciÃ³n.
"""
from __future__ import annotations

import json
import uuid
from pathlib import Path

from sqlalchemy.orm import Session

from app.config import ADMIN_EMAIL, ADMIN_NOMBRE, ADMIN_PASSWORD, ADMIN_RUT, BASE_DIR
from app.database import Base, SessionLocal, engine
from app.models import (
    AuthProviderEnum,
    Category,
    Product,
    ProductVariant,
    RoleEnum,
    User,
)
from app.rut_validador import formatear_rut, normalizar_rut
from app.security import hash_password

DATA_FILE = Path(__file__).resolve().parent / "data" / "catalogo.json"


def crear_admin(db: Session) -> User:
    existente = db.query(User).filter(User.email == ADMIN_EMAIL.lower()).first()
    if existente:
        return existente

    admin = User(
        id=str(uuid.uuid4()),
        rut=normalizar_rut(formatear_rut(ADMIN_RUT)),
        nombre=ADMIN_NOMBRE,
        email=ADMIN_EMAIL.lower(),
        telefono=None,
        hashed_password=hash_password(ADMIN_PASSWORD),
        role=RoleEnum.ADMIN,
        auth_provider=AuthProviderEnum.LOCAL,
        is_active=True,
    )
    db.add(admin)
    db.commit()
    db.refresh(admin)
    print(f"âœ” Administrador creado: {admin.email}")
    return admin


def seed_catalogo(db: Session) -> int:
    if db.query(Product).count() > 0:
        print("â€¢ El catÃ¡logo ya tiene productos; no se vuelve a cargar.")
        return 0

    if not DATA_FILE.exists():
        print(f"âš  No se encontrÃ³ {DATA_FILE}. Se omite el catÃ¡logo.")
        return 0

    data = json.loads(DATA_FILE.read_text(encoding="utf-8"))
    creados = 0

    for cat in data.get("categorias", []):
        existente = db.query(Category).filter(Category.slug == cat["slug"]).first()
        if existente:
            continue
        db.add(
            Category(
                id=cat["id"],
                nombre=cat["nombre"],
                slug=cat["slug"],
                nombre_corto=cat.get("nombreCorto"),
                grupo=cat.get("grupo"),
                descripcion=cat.get("descripcion"),
                imagen_url=cat.get("imagen"),
                orden=cat.get("orden", 0),
                destacada=bool(cat.get("destacada")),
                activa=True,
            )
        )
    db.commit()

    for prod in data.get("productos", []):
        if db.query(Product).filter(Product.id == prod["id"]).first():
            continue

        variantes = prod.get("variantes", [])
        precios = [v["precio"] for v in variantes] or [0]
        product = Product(
            id=prod["id"],
            sku=variantes[0]["sku"] if variantes else prod["id"],
            nombre=prod["nombre"],
            descripcion=prod.get("descripcion"),
            imagen_url=prod.get("imagen"),
            unidad=variantes[0].get("unidad", "unidad") if variantes else "unidad",
            etiqueta=prod.get("etiqueta"),
            destacado=bool(prod.get("destacado")),
            category_id=prod["categoriaSlug"],
            precio_base=min(precios),
            stock=sum(v.get("stock", 0) for v in variantes),
            activo=True,
        )
        db.add(product)

        for v in variantes:
            db.add(
                ProductVariant(
                    id=v["id"],
                    product_id=product.id,
                    sku=v["sku"],
                    medida=v["medida"],
                    precio=v["precio"],
                    precio_anterior=v.get("precioAnterior"),
                    unidad=v.get("unidad", "unidad"),
                    stock=v.get("stock", 0),
                    activo=True,
                )
            )
        creados += 1

        if creados % 100 == 0:
            db.commit()

    db.commit()
    print(f"âœ” CatÃ¡logo cargado: {creados} productos.")
    return creados


def run_seed() -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        crear_admin(db)
        seed_catalogo(db)
    finally:
        db.close()


if __name__ == "__main__":
    run_seed()

