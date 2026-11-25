from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.models import AuthProviderEnum, RoleEnum, StatusCotizacionEnum


# ==========================================================================
# Usuarios y autenticación
# ==========================================================================
class UserBase(BaseModel):
    nombre: str = Field(..., min_length=2, max_length=120, examples=["Juan Pérez"])
    email: EmailStr = Field(..., examples=["juan@empresa.cl"])
    telefono: Optional[str] = Field(None, max_length=30, examples=["+56912345678"])
    rut: Optional[str] = Field(None, max_length=15, examples=["12.345.678-9"])


class UserCreate(UserBase):
    password: str = Field(..., min_length=6, max_length=128)


class UserAdminCreate(UserCreate):
    role: RoleEnum = RoleEnum.VENDEDOR


class UserUpdate(BaseModel):
    nombre: Optional[str] = Field(None, min_length=2, max_length=120)
    telefono: Optional[str] = None
    rut: Optional[str] = None
    email: Optional[EmailStr] = None


class UserAdminUpdate(BaseModel):
    role: Optional[RoleEnum] = None
    is_active: Optional[bool] = None


class LoginRequest(BaseModel):
    email: str = Field(..., description="Correo o RUT del usuario")
    password: str
    remember: bool = False


class GoogleLoginRequest(BaseModel):
    credential: str


class PasswordChange(BaseModel):
    password_actual: str
    password_nueva: str = Field(..., min_length=6)


class UserResponse(BaseModel):
    id: str
    rut: Optional[str] = None
    nombre: str
    email: EmailStr
    telefono: Optional[str] = None
    role: RoleEnum
    auth_provider: AuthProviderEnum
    avatar_url: Optional[str] = None
    is_active: bool = True
    created_at: Optional[datetime] = None
    last_login: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# ==========================================================================
# Categorías
# ==========================================================================
class CategoryBase(BaseModel):
    nombre: str
    slug: str
    nombre_corto: Optional[str] = None
    grupo: Optional[str] = None
    descripcion: Optional[str] = None
    imagen_url: Optional[str] = None
    orden: int = 0
    destacada: bool = False


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(BaseModel):
    nombre: Optional[str] = None
    slug: Optional[str] = None
    nombre_corto: Optional[str] = None
    grupo: Optional[str] = None
    descripcion: Optional[str] = None
    imagen_url: Optional[str] = None
    orden: Optional[int] = None
    destacada: Optional[bool] = None
    activa: Optional[bool] = None


class CategoryResponse(CategoryBase):
    id: str
    total_productos: int = 0

    model_config = ConfigDict(from_attributes=True)


# ==========================================================================
# Productos y variantes (medidas)
# ==========================================================================
class VariantBase(BaseModel):
    sku: str
    medida: str
    precio: int = Field(..., ge=0)
    precio_anterior: Optional[int] = Field(None, ge=0)
    unidad: str = "unidad"
    stock: int = Field(0, ge=0)


class VariantCreate(VariantBase):
    pass


class VariantUpdate(BaseModel):
    sku: Optional[str] = None
    medida: Optional[str] = None
    precio: Optional[int] = Field(None, ge=0)
    precio_anterior: Optional[int] = Field(None, ge=0)
    unidad: Optional[str] = None
    stock: Optional[int] = Field(None, ge=0)
    activo: Optional[bool] = None


class VariantResponse(VariantBase):
    id: str
    activo: bool = True

    model_config = ConfigDict(from_attributes=True)


class ProductBase(BaseModel):
    sku: str
    nombre: str
    descripcion: Optional[str] = None
    imagen_url: Optional[str] = None
    unidad: str = "unidad"
    etiqueta: Optional[str] = None
    destacado: bool = False
    category_id: Optional[str] = None


class ProductCreate(ProductBase):
    variantes: List[VariantCreate] = Field(default_factory=list)


class ProductUpdate(BaseModel):
    sku: Optional[str] = None
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    imagen_url: Optional[str] = None
    unidad: Optional[str] = None
    etiqueta: Optional[str] = None
    destacado: Optional[bool] = None
    activo: Optional[bool] = None
    category_id: Optional[str] = None


class ProductResponse(ProductBase):
    id: str
    precio_base: int = 0
    stock: int = 0
    activo: bool = True
    categoria_slug: Optional[str] = None
    categoria_nombre: Optional[str] = None
    variantes: List[VariantResponse] = Field(default_factory=list)
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class ProductListResponse(BaseModel):
    total: int
    items: List[ProductResponse]


# ==========================================================================
# Cotizaciones
# ==========================================================================
class CotizacionItemCreate(BaseModel):
    variant_id: Optional[str] = None
    product_id: Optional[str] = None
    cantidad: int = Field(..., gt=0, le=100000)


class CotizacionCreate(BaseModel):
    rut: Optional[str] = None
    nombre: str = Field(..., min_length=2, max_length=160)
    email: EmailStr
    telefono: Optional[str] = None
    empresa: Optional[str] = None
    direccion: Optional[str] = None
    comentarios: Optional[str] = None
    items: List[CotizacionItemCreate] = Field(..., min_length=1)


class CotizacionStatusUpdate(BaseModel):
    estado: StatusCotizacionEnum


class CotizacionItemResponse(BaseModel):
    id: str
    product_id: Optional[str] = None
    variant_id: Optional[str] = None
    nombre_producto: str
    medida: Optional[str] = None
    unidad: Optional[str] = None
    cantidad: int
    precio_unitario: int
    subtotal: int

    model_config = ConfigDict(from_attributes=True)


class CotizacionResponse(BaseModel):
    id: str
    folio: Optional[int] = None
    user_id: Optional[str] = None
    rut: Optional[str] = None
    nombre_contacto: str
    email: EmailStr
    telefono: Optional[str] = None
    empresa: Optional[str] = None
    direccion: Optional[str] = None
    comentarios: Optional[str] = None
    total_neto: int
    iva: int
    total_total: int
    estado: StatusCotizacionEnum
    created_at: Optional[datetime] = None
    items: List[CotizacionItemResponse] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)


class CotizacionListResponse(BaseModel):
    total: int
    items: List[CotizacionResponse]


# ==========================================================================
# Auditoría / panel
# ==========================================================================
class AuditLogResponse(BaseModel):
    id: str
    user_id: Optional[str] = None
    accion: str
    detalles: Optional[str] = None
    ip_address: Optional[str] = None
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)


class AdminStats(BaseModel):
    productos: int
    categorias: int
    cotizaciones: int
    cotizaciones_pendientes: int
    usuarios: int
    ventas_cotizadas: int
    ultimas_cotizaciones: List[CotizacionResponse] = Field(default_factory=list)


class MensajeResponse(BaseModel):
    status: str = "ok"
    mensaje: str
