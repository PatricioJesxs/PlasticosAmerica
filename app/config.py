"""Configuración central del backend.

Todos los valores se pueden sobrescribir con variables de entorno o con un
archivo `.env` en la raíz del proyecto. No se necesitan dependencias extra.
"""
from __future__ import annotations

import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent


def _cargar_env() -> None:
    """Carga un .env simple (CLAVE=valor) si existe."""
    env_file = BASE_DIR / ".env"
    if not env_file.exists():
        return
    for raw in env_file.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        os.environ.setdefault(key, value)


_cargar_env()

# ---------------------------------------------------------------------------
# Aplicación
# ---------------------------------------------------------------------------
APP_NAME = os.getenv("APP_NAME", "Plásticos América API")
APP_VERSION = "2.0.0"
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
DEBUG = os.getenv("DEBUG", "true").lower() in {"1", "true", "yes"}

# ---------------------------------------------------------------------------
# Base de datos
# ---------------------------------------------------------------------------
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{(BASE_DIR / 'plasticos_america.db').as_posix()}")

# ---------------------------------------------------------------------------
# Seguridad / JWT
# ---------------------------------------------------------------------------
SECRET_KEY = os.getenv("SECRET_KEY", "cambia-esta-clave-en-produccion-plasticos-america-2026")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
ACCESS_TOKEN_EXPIRE_DAYS_REMEMBER = int(os.getenv("ACCESS_TOKEN_EXPIRE_DAYS_REMEMBER", "30"))

# ---------------------------------------------------------------------------
# CORS
# ---------------------------------------------------------------------------
CORS_ORIGINS = [
    o.strip()
    for o in os.getenv(
        "CORS_ORIGINS",
        "http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001,https://plasticosamerica.cl,https://www.plasticosamerica.cl",
    ).split(",")
    if o.strip()
]

# ---------------------------------------------------------------------------
# Google Sign-In
# ---------------------------------------------------------------------------
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")

# ---------------------------------------------------------------------------
# Administrador inicial (se crea al primer arranque si no existe)
# ---------------------------------------------------------------------------
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "admin@plasticosamerica.cl")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "Admin1234!")
ADMIN_NOMBRE = os.getenv("ADMIN_NOMBRE", "Administrador Plásticos América")
ADMIN_RUT = os.getenv("ADMIN_RUT", "11.111.111-1")

# ---------------------------------------------------------------------------
# Datos del negocio (usados por la API y el frontend)
# ---------------------------------------------------------------------------
EMPRESA = {
    "nombre": "Plásticos América Ltda.",
    "fundacion": 1980,
    "telefono": "22 338 6700",
    "telefono_alt": "22 222 6874",
    "email": "ventas@plasticosamerica.cl",
    "email_cotizaciones": "cotizaciones@plasticosamerica.cl",
    "casa_matriz": "Santa Elena 825 y 835, Santiago",
    "sucursal": "San Camilo 834, Santiago",
    "horario": "Lunes a jueves 8:00 a 17:30 hrs · Viernes 8:00 a 17:00 hrs",
}
