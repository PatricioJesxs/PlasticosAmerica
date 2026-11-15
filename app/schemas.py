from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import List, Optional
from datetime import datetime
from app.models import RoleEnum, StatusCotizacionEnum


# ==========================================
# 1. SCHEMAS DE USUARIO (User)
# ==========================================
class UserBase(BaseModel):
    rut: str = Field(..., example="12.345.678-9")
    nombre: str = Field(..., min_length=2, example="Juan Pérez")
    email: EmailStr = Field(..., example="juan@empresa.cl")
    telefono: str = Field(..., example="+56912345678")

class UserCreate(UserBase):
    password: str = Field(..., min_length=6, description="Contraseña sin encriptar")
    role: Optional[RoleEnum] = RoleEnum.CLIENTE

class UserUpdate(BaseModel):
    nombre: Optional[str] = None
    email: Optional[EmailStr] = None
    telefono: Optional[str] = None
    role: Optional[RoleEnum] = None

class UserLogin(BaseModel):
    rut_o_email: str
    password: str

class UserResponse(UserBase):
    id: str
    role: RoleEnum
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ==========================================
# 2. SCHEMAS DE CATEGORÍA (Category)
# ==========================================
class CategoryBase(BaseModel):
    nombre: str = Field(..., example="Bolsas Industriales")
    slug: str = Field(..., example="bolsas-industriales")

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(BaseModel):
    nombre: Optional[str] = None
    slug: Optional[str] = None

class CategoryResponse(CategoryBase):
    id: str

    model_config = ConfigDict(from_attributes=True)


# ==========================================
# 3. SCHEMAS DE PRODUCTO (Product)
# ==========================================
class ProductBase(BaseModel):
    sku: str = Field(..., example="BOL-IND-001")
    nombre: str = Field(..., example="Manga Polietileno Alta Densidad 100 micras")
    descripcion: Optional[str] = Field(None, example="Rollo de 50 kilos resistente a tracción")
    precio_base: int = Field(..., gt=0, description="Precio neto en CLP", example=25990)
    stock: int = Field(default=0, ge=0, example=150)
    imagen_url: Optional[str] = None
    category_id: Optional[str] = None

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    sku: Optional[str] = None
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    precio_base: Optional[int] = Field(None, gt=0)
    stock: Optional[int] = Field(None, ge=0)
    imagen_url: Optional[str] = None
    category_id: Optional[str] = None

class ProductResponse(ProductBase):
    id: str
    category: Optional[CategoryResponse] = None

    model_config = ConfigDict(from_attributes=True)


# ==========================================
# 4. SCHEMAS DE ÍTEMS DE COTIZACIÓN (CotizacionItem)
# ==========================================
class CotizacionItemCreate(BaseModel):
    product_id: str
    cantidad: int = Field(..., gt=0, example=10)

class CotizacionItemResponse(BaseModel):
    id: str
    product_id: str
    cantidad: int
    precio_unitario: int
    product: Optional[ProductResponse] = None

    model_config = ConfigDict(from_attributes=True)


# ==========================================
# 5. SCHEMAS DE COTIZACIÓN (Cotizacion)
# ==========================================
class CotizacionCreate(BaseModel):
    rut: str = Field(..., example="76.123.456-K")
    nombre: str = Field(..., example="Comercializadora del Sur SpA")
    email: EmailStr = Field(..., example="compras@surspa.cl")
    telefono: str = Field(..., example="+56987654321")
    items: List[CotizacionItemCreate] = Field(..., min_length=1)

class CotizacionStatusUpdate(BaseModel):
    estado: StatusCotizacionEnum

class CotizacionResponse(BaseModel):
    id: str
    folio: Optional[int] = None
    user_id: str
    total_neto: int
    iva: int
    total_total: int
    estado: StatusCotizacionEnum
    created_at: datetime
    user: Optional[UserResponse] = None
    items: List[CotizacionItemResponse] = []

    model_config = ConfigDict(from_attributes=True)


# ==========================================
# 6. SCHEMAS DE AUDITORÍA Y SEGURIDAD (AuditLog)
# ==========================================
class AuditLogCreate(BaseModel):
    user_id: Optional[str] = None
    accion: str
    ip_address: str

class AuditLogResponse(BaseModel):
    id: str
    user_id: Optional[str] = None
    accion: str
    ip_address: str
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)