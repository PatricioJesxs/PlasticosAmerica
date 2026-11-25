from __future__ import annotations

import os
import shutil
import uuid
from pathlib import Path
from typing import Optional

from fastapi import UploadFile, File

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, or_
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models import Category, Product, ProductVariant, RoleEnum, User
from app.schemas import (
    CategoryCreate,
    CategoryResponse,
    CategoryUpdate,
    MensajeResponse,
    ProductCreate,
    ProductListResponse,
    ProductResponse,
    ProductUpdate,
    VariantCreate,
    VariantResponse,
    VariantUpdate,
)
from app.security import require_roles

router = APIRouter(prefix="/api/productos", tags=["Catálogo"])

StaffDep = require_roles(RoleEnum.ADMIN, RoleEnum.VENDEDOR)

UPLOADS_DIR = Path(__file__).resolve().parent.parent.parent / "uploads"
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)


# --------------------------------------------------------------------------
# Serialización
# --------------------------------------------------------------------------
def serializar_producto(product: Product) -> ProductResponse:
    variantes = [v for v in product.variantes if v.activo]
    precios = [v.precio for v in variantes] or [product.precio_base or 0]
    return ProductResponse(
        id=product.id,
        sku=product.sku,
        nombre=product.nombre,
        descripcion=product.descripcion,
        imagen_url=product.imagen_url,
        unidad=product.unidad or "unidad",
        etiqueta=product.etiqueta,
        destacado=bool(product.destacado),
        category_id=product.category_id,
        precio_base=min(precios),
        stock=sum(v.stock for v in variantes),
        activo=bool(product.activo),
        categoria_slug=product.category.slug if product.category else None,
        categoria_nombre=product.category.nombre if product.category else None,
        variantes=[VariantResponse.model_validate(v) for v in variantes],
        created_at=product.created_at,
    )


def _query_productos(db: Session):
    return db.query(Product).options(
        joinedload(Product.category), joinedload(Product.variantes)
    )


# --------------------------------------------------------------------------
# Endpoints públicos
# --------------------------------------------------------------------------
@router.get("/categorias", response_model=list[CategoryResponse])
def listar_categorias(db: Session = Depends(get_db)):
    conteos = dict(
        db.query(Product.category_id, func.count(Product.id))
        .filter(Product.activo.is_(True))
        .group_by(Product.category_id)
        .all()
    )
    categorias = (
        db.query(Category)
        .filter(Category.activa.is_(True))
        .order_by(Category.orden.asc(), Category.nombre.asc())
        .all()
    )
    return [
        CategoryResponse(
            id=c.id,
            nombre=c.nombre,
            slug=c.slug,
            nombre_corto=c.nombre_corto,
            grupo=c.grupo,
            descripcion=c.descripcion,
            imagen_url=c.imagen_url,
            orden=c.orden or 0,
            destacada=bool(c.destacada),
            total_productos=conteos.get(c.id, 0),
        )
        for c in categorias
    ]


@router.get("", response_model=ProductListResponse)
def listar_productos(
    db: Session = Depends(get_db),
    q: Optional[str] = Query(None, description="Búsqueda por nombre, SKU, medida o categoría"),
    categoria: Optional[str] = Query(None, description="Slug de la categoría"),
    destacados: bool = False,
    ofertas: bool = False,
    limit: int = Query(60, ge=1, le=300),
    offset: int = Query(0, ge=0),
    orden: str = Query("relevancia", pattern="^(relevancia|precio_asc|precio_desc|nombre|nuevos)$"),
):
    query = _query_productos(db).filter(Product.activo.is_(True))

    if categoria:
        query = query.join(Category).filter(Category.slug == categoria)
    if destacados:
        query = query.filter(Product.destacado.is_(True))
    if ofertas:
        query = query.join(Product.variantes).filter(ProductVariant.precio_anterior.isnot(None)).distinct()

    if q:
        texto = f"%{q.strip()}%"
        query = (
            query.outerjoin(Category, Product.category_id == Category.id)
            .outerjoin(ProductVariant, ProductVariant.product_id == Product.id)
            .filter(
                or_(
                    Product.nombre.ilike(texto),
                    Product.sku.ilike(texto),
                    Product.descripcion.ilike(texto),
                    Category.nombre.ilike(texto),
                    ProductVariant.sku.ilike(texto),
                    ProductVariant.medida.ilike(texto),
                )
            )
            .distinct()
        )

    total = query.count()

    if orden == "precio_asc":
        query = query.order_by(Product.precio_base.asc())
    elif orden == "precio_desc":
        query = query.order_by(Product.precio_base.desc())
    elif orden == "nombre":
        query = query.order_by(Product.nombre.asc())
    elif orden == "nuevos":
        query = query.order_by(Product.created_at.desc())
    else:
        query = query.order_by(Product.destacado.desc(), Product.nombre.asc())

    productos = query.offset(offset).limit(limit).all()
    return ProductListResponse(total=total, items=[serializar_producto(p) for p in productos])


@router.get("/{product_id}", response_model=ProductResponse)
def obtener_producto(product_id: str, db: Session = Depends(get_db)):
    product = _query_productos(db).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Producto no encontrado.")
    return serializar_producto(product)


@router.get("/slug/{slug}", response_model=ProductResponse)
def obtener_producto_por_slug(slug: str, db: Session = Depends(get_db)):
    """Permite resolver un producto por su SKU principal."""
    product = _query_productos(db).filter(Product.sku == slug).first()
    if not product:
        raise HTTPException(status_code=404, detail="Producto no encontrado.")
    return serializar_producto(product)


# --------------------------------------------------------------------------
# Administración de productos
# --------------------------------------------------------------------------
# --------------------------------------------------------------------------
# Subida de imagenes (panel de trabajadores)
# --------------------------------------------------------------------------
@router.post("/upload-imagen", status_code=201)
def subir_imagen(
    archivo: UploadFile = File(...),
    _: User = Depends(StaffDep),
):
    if not archivo.content_type or not archivo.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="El archivo debe ser una imagen (JPG, PNG, WebP).")
    ext = Path(archivo.filename or "imagen").suffix.lower()
    if ext not in {".jpg", ".jpeg", ".png", ".webp", ".gif"}:
        ext = ".jpg"
    nombre = f"{uuid.uuid4().hex}{ext}"
    destino = UPLOADS_DIR / nombre
    try:
        with destino.open("wb") as buffer:
            shutil.copyfileobj(archivo.file, buffer)
    finally:
        archivo.file.close()
    return {"url": f"/static/{nombre}"}


@router.post("", response_model=ProductResponse, status_code=201)
def crear_producto(
    data: ProductCreate,
    _: User = Depends(StaffDep),
    db: Session = Depends(get_db),
):
    if db.query(Product).filter(Product.sku == data.sku).first():
        raise HTTPException(status_code=409, detail="Ya existe un producto con ese SKU.")
    if data.category_id and not db.query(Category).filter(Category.id == data.category_id).first():
        raise HTTPException(status_code=404, detail="Categoría no encontrada.")

    variantes = data.variantes or []
    precios = [v.precio for v in variantes] or [0]

    product = Product(
        id=str(uuid.uuid4()),
        sku=data.sku,
        nombre=data.nombre,
        descripcion=data.descripcion,
        imagen_url=data.imagen_url,
        unidad=data.unidad,
        etiqueta=data.etiqueta,
        destacado=data.destacado,
        category_id=data.category_id,
        precio_base=min(precios),
        stock=sum(v.stock for v in variantes),
        activo=True,
    )
    db.add(product)
    for v in variantes:
        db.add(
            ProductVariant(
                id=str(uuid.uuid4()),
                product_id=product.id,
                sku=v.sku,
                medida=v.medida,
                precio=v.precio,
                precio_anterior=v.precio_anterior,
                unidad=v.unidad,
                stock=v.stock,
            )
        )
    db.commit()
    db.refresh(product)
    return serializar_producto(product)


@router.put("/{product_id}", response_model=ProductResponse)
def actualizar_producto(
    product_id: str,
    data: ProductUpdate,
    _: User = Depends(StaffDep),
    db: Session = Depends(get_db),
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Producto no encontrado.")

    if data.sku and data.sku != product.sku:
        if db.query(Product).filter(Product.sku == data.sku).first():
            raise HTTPException(status_code=409, detail="Ya existe un producto con ese SKU.")
        product.sku = data.sku
    if data.category_id and not db.query(Category).filter(Category.id == data.category_id).first():
        raise HTTPException(status_code=404, detail="Categoría no encontrada.")

    for campo in ["nombre", "descripcion", "imagen_url", "unidad", "etiqueta", "destacado", "activo", "category_id"]:
        valor = getattr(data, campo)
        if valor is not None:
            setattr(product, campo, valor)

    db.commit()
    db.refresh(product)
    return serializar_producto(product)


@router.delete("/{product_id}", response_model=MensajeResponse)
def eliminar_producto(
    product_id: str,
    _: User = Depends(StaffDep),
    db: Session = Depends(get_db),
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Producto no encontrado.")
    product.activo = False
    db.commit()
    return MensajeResponse(mensaje="Producto desactivado del catálogo.")


# --------------------------------------------------------------------------
# Variantes / medidas
# --------------------------------------------------------------------------
@router.post("/{product_id}/variantes", response_model=VariantResponse, status_code=201)
def crear_variante(
    product_id: str,
    data: VariantCreate,
    _: User = Depends(StaffDep),
    db: Session = Depends(get_db),
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Producto no encontrado.")
    if db.query(ProductVariant).filter(ProductVariant.sku == data.sku).first():
        raise HTTPException(status_code=409, detail="Ya existe una medida con ese SKU.")

    variante = ProductVariant(
        id=str(uuid.uuid4()),
        product_id=product.id,
        sku=data.sku,
        medida=data.medida,
        precio=data.precio,
        precio_anterior=data.precio_anterior,
        unidad=data.unidad,
        stock=data.stock,
    )
    db.add(variante)
    db.commit()
    db.refresh(variante)
    return variante


@router.put("/variantes/{variant_id}", response_model=VariantResponse)
def actualizar_variante(
    variant_id: str,
    data: VariantUpdate,
    _: User = Depends(StaffDep),
    db: Session = Depends(get_db),
):
    variante = db.query(ProductVariant).filter(ProductVariant.id == variant_id).first()
    if not variante:
        raise HTTPException(status_code=404, detail="Medida no encontrada.")
    if data.sku and data.sku != variante.sku:
        if db.query(ProductVariant).filter(ProductVariant.sku == data.sku).first():
            raise HTTPException(status_code=409, detail="Ya existe una medida con ese SKU.")
        variante.sku = data.sku

    for campo in ["medida", "precio", "precio_anterior", "unidad", "stock", "activo"]:
        valor = getattr(data, campo)
        if valor is not None:
            setattr(variante, campo, valor)

    db.commit()
    db.refresh(variante)
    return variante


@router.delete("/variantes/{variant_id}", response_model=MensajeResponse)
def eliminar_variante(
    variant_id: str,
    _: User = Depends(StaffDep),
    db: Session = Depends(get_db),
):
    variante = db.query(ProductVariant).filter(ProductVariant.id == variant_id).first()
    if not variante:
        raise HTTPException(status_code=404, detail="Medida no encontrada.")
    db.delete(variante)
    db.commit()
    return MensajeResponse(mensaje="Medida eliminada.")


# --------------------------------------------------------------------------
# Administración de categorías
# --------------------------------------------------------------------------
@router.post("/categorias", response_model=CategoryResponse, status_code=201)
def crear_categoria(
    data: CategoryCreate,
    _: User = Depends(StaffDep),
    db: Session = Depends(get_db),
):
    if db.query(Category).filter(Category.slug == data.slug).first():
        raise HTTPException(status_code=409, detail="Ya existe una categoría con ese slug.")
    cat = Category(id=str(uuid.uuid4()), **data.model_dump())
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return CategoryResponse(id=cat.id, **data.model_dump(), total_productos=0)


@router.put("/categorias/{category_id}", response_model=CategoryResponse)
def actualizar_categoria(
    category_id: str,
    data: CategoryUpdate,
    _: User = Depends(StaffDep),
    db: Session = Depends(get_db),
):
    cat = db.query(Category).filter(Category.id == category_id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Categoría no encontrada.")
    for campo, valor in data.model_dump(exclude_unset=True).items():
        setattr(cat, campo, valor)
    db.commit()
    db.refresh(cat)
    total = db.query(Product).filter(Product.category_id == cat.id, Product.activo.is_(True)).count()
    return CategoryResponse(
        id=cat.id,
        nombre=cat.nombre,
        slug=cat.slug,
        nombre_corto=cat.nombre_corto,
        grupo=cat.grupo,
        descripcion=cat.descripcion,
        imagen_url=cat.imagen_url,
        orden=cat.orden or 0,
        destacada=bool(cat.destacada),
        total_productos=total,
    )
