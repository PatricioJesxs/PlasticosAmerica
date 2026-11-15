from fastapi import FastAPI
from fastapi import Depends
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.api import cotizaciones

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Plasticos America", 
    description="Backend para la gestión de cotizaciones y usuarios de Plasticos America generando asi una construccion robusta y escalable de la aplicacion web", 
    version="1.0.0")


# Permitir conexion entre el fronted Reat y el Backend de Python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(cotizaciones.router)

@app.get("/")
def estado_backend():
    return {
        "empresa": "Plásticos América Chile",
        "estado": "Online 🚀",
        "base_de_datos": "PostgreSQL Conectada"
    }

