from contextlib import asynccontextmanager

from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app import models  # noqa: F401  (registra las tablas en SQLAlchemy)
from app.api import admin, auth, cotizaciones, productos
from app.config import APP_NAME, APP_VERSION, CORS_ORIGINS, EMPRESA, ENVIRONMENT
from app.database import Base, engine
from app.seed import run_seed


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    try:
        run_seed()
    except Exception as exc:  # noqa: BLE001
        print(f"⚠ No se pudo ejecutar la carga inicial: {exc}")
    yield


app = FastAPI(
    title=APP_NAME,
    description=(
        "API oficial de Plásticos América: catálogo, cuentas de usuario, "
        "cotizaciones y panel de administración."
    ),
    version=APP_VERSION,
    lifespan=lifespan,
)

# Archivos estaticos (imagenes subidas desde el panel).
UPLOADS_DIR = Path(__file__).resolve().parent.parent / "uploads"
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/static", StaticFiles(directory=str(UPLOADS_DIR)), name="static")

_allow_all_origins = "*" in CORS_ORIGINS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if _allow_all_origins else CORS_ORIGINS,
    allow_credentials=not _allow_all_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(productos.router)
app.include_router(cotizaciones.router)
app.include_router(admin.router)


@app.get("/", tags=["Sistema"])
def estado_backend():
    return {
        "empresa": EMPRESA["nombre"],
        "estado": "online",
        "version": APP_VERSION,
        "entorno": ENVIRONMENT,
        "documentacion": "/docs",
    }


@app.get("/api/health", tags=["Sistema"])
def health():
    return {"status": "ok", "empresa": EMPRESA["nombre"]}
