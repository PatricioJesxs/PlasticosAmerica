import enum
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, Enum as SQLEnum, Text, ForeignKey
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
    APROBADA = "APROBADA"
    RECHAZADA = "RECHAZADA"

class User(Base):
    __tablename__ = "usuario"
    id = Column(String, primary_key=True, index=True)
    rut = Column(String, nullable=False, index=True, unique=True)
    nombre = Column(String, nullable=False) 
    email = Column(String, unique=True, index=True, nullable=False)
    telefono = Column(String, nullable=False) 
    hashed_password = Column(String, nullable=False) 
    role = Column(SQLEnum(RoleEnum), default=RoleEnum.CLIENTE)
    created_at = Column(DateTime, default=datetime.utcnow) 

    # Relaciones necesarias para back_populates
    cotizaciones = relationship("Cotizacion", back_populates="user")
    audit_logs = relationship("AuditLog", back_populates="user")

class Category(Base):
    __tablename__ = "categorias"

    id = Column(String, primary_key=True, index=True)
    nombre = Column(String, unique=True, nullable=False)
    slug = Column(String, unique=True, nullable=False)

    productos = relationship("Product", back_populates="category")
    
class Product(Base):
    __tablename__ = "productos"

    id = Column(String, primary_key=True, index=True)
    sku = Column(String, unique=True, index=True, nullable=False)
    nombre = Column(String, nullable=False)
    descripcion = Column(Text, nullable=True)
    precio_base = Column(Integer, nullable=False)  # Monto Neto en CLP
    stock = Column(Integer, default=0)
    imagen_url = Column(String, nullable=True)
    category_id = Column(String, ForeignKey("categorias.id"), nullable=True)  # Apunta a "categorias.id"

    category = relationship("Category", back_populates="productos")
    items = relationship("CotizacionItem", back_populates="product")

class Cotizacion(Base):
    __tablename__ = "cotizaciones"

    id = Column(String, primary_key=True, index=True)
    folio = Column(Integer, unique=True, nullable=True)  # Único sin ser doble primary key
    user_id = Column(String, ForeignKey("usuario.id"), nullable=False)  # Apunta a "usuario.id"
    total_neto = Column(Integer, nullable=False)
    iva = Column(Integer, nullable=False)
    total_total = Column(Integer, nullable=False)
    estado = Column(SQLEnum(StatusCotizacionEnum), default=StatusCotizacionEnum.PENDIENTE)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="cotizaciones")
    items = relationship("CotizacionItem", back_populates="cotizacion")

class CotizacionItem(Base):
    __tablename__ = "cotizacion_items"

    id = Column(String, primary_key=True, index=True)
    cotizacion_id = Column(String, ForeignKey("cotizaciones.id"), nullable=False)
    product_id = Column(String, ForeignKey("productos.id"), nullable=False)
    cantidad = Column(Integer, nullable=False)
    precio_unitario = Column(Integer, nullable=False)  # Monto Neto en CLP

    cotizacion = relationship("Cotizacion", back_populates="items")
    product = relationship("Product", back_populates="items")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("usuario.id"), nullable=True)  # Apunta a "usuario.id"
    accion = Column(String, nullable=False)
    ip_address = Column(String, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="audit_logs")