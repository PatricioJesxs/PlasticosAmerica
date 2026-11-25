from datetime import datetime
import enum

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Enum as SQLEnum,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import relationship

from app.database import Base


class RoleEnum(str, enum.Enum):
    CLIENTE = "CLIENTE"
    MAYORISTA = "MAYORISTA"
    VENDEDOR = "VENDEDOR"
    ADMIN = "ADMIN"


class StatusCotizacionEnum(str, enum.Enum):
    PENDIENTE = "PENDIENTE"
    EN_REVISION = "EN_REVISION"
    RESPONDIDA = "RESPONDIDA"
    APROBADA = "APROBADA"
    RECHAZADA = "RECHAZADA"


class AuthProviderEnum(str, enum.Enum):
    LOCAL = "LOCAL"
    GOOGLE = "GOOGLE"


class User(Base):
    __tablename__ = "usuario"

    id = Column(String, primary_key=True, index=True)
    rut = Column(String, nullable=True, index=True, unique=True)
    nombre = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    telefono = Column(String, nullable=True)
    hashed_password = Column(String, nullable=True)
    role = Column(SQLEnum(RoleEnum), default=RoleEnum.CLIENTE, nullable=False)
    auth_provider = Column(SQLEnum(AuthProviderEnum), default=AuthProviderEnum.LOCAL, nullable=False)
    google_id = Column(String, nullable=True, unique=True, index=True)
    avatar_url = Column(String, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)

    cotizaciones = relationship("Cotizacion", back_populates="user")
    audit_logs = relationship("AuditLog", back_populates="user")


class Category(Base):
    __tablename__ = "categorias"

    id = Column(String, primary_key=True, index=True)
    nombre = Column(String, unique=True, nullable=False)
    slug = Column(String, unique=True, nullable=False, index=True)
    nombre_corto = Column(String, nullable=True)
    grupo = Column(String, nullable=True)
    descripcion = Column(Text, nullable=True)
    imagen_url = Column(String, nullable=True)
    orden = Column(Integer, default=0)
    destacada = Column(Boolean, default=False)
    activa = Column(Boolean, default=True)

    productos = relationship("Product", back_populates="category")


class Product(Base):
    __tablename__ = "productos"

    id = Column(String, primary_key=True, index=True)
    sku = Column(String, unique=True, index=True, nullable=False)
    nombre = Column(String, nullable=False, index=True)
    descripcion = Column(Text, nullable=True)
    precio_base = Column(Integer, nullable=False, default=0)
    stock = Column(Integer, default=0)
    imagen_url = Column(String, nullable=True)
    unidad = Column(String, default="unidad")
    etiqueta = Column(String, nullable=True)
    destacado = Column(Boolean, default=False)
    activo = Column(Boolean, default=True, index=True)
    category_id = Column(String, ForeignKey("categorias.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    category = relationship("Category", back_populates="productos")
    variantes = relationship(
        "ProductVariant",
        back_populates="product",
        cascade="all, delete-orphan",
        order_by="ProductVariant.precio",
    )
    items = relationship("CotizacionItem", back_populates="product")


class ProductVariant(Base):
    __tablename__ = "producto_variantes"

    id = Column(String, primary_key=True, index=True)
    product_id = Column(String, ForeignKey("productos.id"), nullable=False, index=True)
    sku = Column(String, unique=True, index=True, nullable=False)
    medida = Column(String, nullable=False)
    precio = Column(Integer, nullable=False)
    precio_anterior = Column(Integer, nullable=True)
    unidad = Column(String, default="unidad")
    stock = Column(Integer, default=0)
    activo = Column(Boolean, default=True)

    product = relationship("Product", back_populates="variantes")


class Cotizacion(Base):
    __tablename__ = "cotizaciones"

    id = Column(String, primary_key=True, index=True)
    folio = Column(Integer, unique=True, nullable=True, index=True)
    user_id = Column(String, ForeignKey("usuario.id"), nullable=True, index=True)
    rut = Column(String, nullable=True)
    nombre_contacto = Column(String, nullable=False)
    email = Column(String, nullable=False)
    telefono = Column(String, nullable=True)
    empresa = Column(String, nullable=True)
    direccion = Column(String, nullable=True)
    comentarios = Column(Text, nullable=True)
    total_neto = Column(Integer, nullable=False, default=0)
    iva = Column(Integer, nullable=False, default=0)
    total_total = Column(Integer, nullable=False, default=0)
    estado = Column(SQLEnum(StatusCotizacionEnum), default=StatusCotizacionEnum.PENDIENTE, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="cotizaciones")
    items = relationship("CotizacionItem", back_populates="cotizacion", cascade="all, delete-orphan")


class CotizacionItem(Base):
    __tablename__ = "cotizacion_items"

    id = Column(String, primary_key=True, index=True)
    cotizacion_id = Column(String, ForeignKey("cotizaciones.id"), nullable=False, index=True)
    product_id = Column(String, ForeignKey("productos.id"), nullable=True)
    variant_id = Column(String, ForeignKey("producto_variantes.id"), nullable=True)
    nombre_producto = Column(String, nullable=False)
    medida = Column(String, nullable=True)
    unidad = Column(String, nullable=True)
    cantidad = Column(Integer, nullable=False)
    precio_unitario = Column(Integer, nullable=False)
    subtotal = Column(Integer, nullable=False)

    cotizacion = relationship("Cotizacion", back_populates="items")
    product = relationship("Product", back_populates="items")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("usuario.id"), nullable=True)
    accion = Column(String, nullable=False)
    detalles = Column(Text, nullable=True)
    ip_address = Column(String, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="audit_logs")
