# Guía de despliegue — Plásticos América

Documento operativo para publicar el sitio en internet. El proyecto tiene dos
piezas que deben ejecutarse siempre juntas:

| Pieza | Tecnología | Puerto interno |
|-------|-----------|----------------|
| Frontend | Next.js 16 (React 19) | 3000 |
| Backend | FastAPI + SQLAlchemy | 8000 |
| Base de datos | PostgreSQL 16 (producción) / SQLite (desarrollo) | 5432 |

---

## 1. Aviso importante sobre "hosting WordPress"

Un hosting compartido de WordPress **solo ejecuta PHP y MySQL**. No puede
ejecutar Node.js (Next.js) ni Python (FastAPI). Por eso, subir este proyecto
"como WordPress" no es posible tal cual.

Tienes tres caminos válidos:

1. **VPS con Docker (recomendado).** Un servidor propio (DigitalOcean, Hetzner,
   AWS Lightsail, Vultr, Contabo) desde USD 5–10/mes. Ejecuta los tres
   contenedores con `docker compose` y Nginx como proxy. Es la opción más
   económica y con control total.
2. **Plataformas gestionadas.** Frontend en Vercel y backend + PostgreSQL en
   Railway, Render o Fly.io. Más simple, pero son dos servicios y suelen costar
   más al crecer.
3. **WordPress como vitrina + tienda en subdominio.** Mantienes el WordPress
   actual en `plasticosamerica.cl` y publicas esta aplicación en
   `tienda.plasticosamerica.cl` (mismo VPS o plataforma gestionada). WordPress
   queda solo para el blog/institucional y enlaza al catálogo.

> Si tu proveedor es de "hosting WordPress" y no ofrece VPS, pide el plan VPS o
> cloud del mismo proveedor. Los planes compartidos no sirven para este stack.

---

## 2. Requisitos

### Producción
- VPS con Ubuntu 22.04/24.04, 2 vCPU y 2 GB de RAM como mínimo.
- Docker Engine 24+ y Docker Compose v2 (`docker compose version`).
- Dominio con acceso a DNS (ej. `plasticosamerica.cl`).
- Puertos 80 y 443 abiertos en el firewall.

### Desarrollo local
- Python 3.11+ y Node.js 20.9+ (recomendado 22).
- Sin Docker también funciona: SQLite + `npm run dev`.

---

## 3. Desarrollo local

### Backend
```bash
python -m venv venv
# Windows
venv\Scripts\activate
# Linux / macOS
source venv/bin/activate

pip install -r requirements.txt
copy .env.example .env      # Linux/macOS: cp .env.example .env
# Para desarrollo usa SQLite: deja DATABASE_URL comentado o usa:
# DATABASE_URL=sqlite:///./plasticos_america.db

uvicorn app.main:app --reload --port 8000
```

- API: http://localhost:8000
- Documentación interactiva: http://localhost:8000/docs
- En el primer arranque se crean las tablas, se cargan los 624 productos y se
  crea el administrador definido en `.env`.

### Frontend
```bash
cd frontend
npm install
# NEXT_PUBLIC_API_URL=http://localhost:8000 en .env.local
npm run dev
```

- Sitio: http://localhost:3000



---

## 4. Despliegue en VPS con Docker (paso a paso)

### 4.1 Preparar el servidor
```bash
# Ubuntu
sudo apt update && sudo apt upgrade -y
sudo apt install -y git nginx certbot python3-certbot-nginx

# Docker (script oficial)
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER   # cierra y abre sesión después
```

### 4.2 Subir el proyecto
```bash
git clone <URL-DE-TU-REPOSITORIO> plasticos-america
cd plasticos-america
```

Si no usas Git, copia el proyecto por SFTP/rsync excluyendo `venv/`,
`node_modules/`, `.next/` y `.tmp/`.

### 4.3 Configurar variables
```bash
cp .env.example .env
nano .env
```

Valores mínimos a cambiar:

| Variable | Ejemplo producción | Notas |
|----------|--------------------|-------|
| `SECRET_KEY` | cadena aleatoria de 64+ caracteres | **Obligatorio cambiarla** |
| `POSTGRES_PASSWORD` | contraseña fuerte | La usa el contenedor `db` |
| `ADMIN_PASSWORD` | contraseña fuerte | Se aplica solo al crear el admin |
| `CORS_ORIGINS` | `https://plasticosamerica.cl,https://www.plasticosamerica.cl` | Sin barra final |
| `NEXT_PUBLIC_API_URL` | `https://plasticosamerica.cl` | El navegador llama a la API por el mismo dominio (Nginx enruta `/api`) |
| `GOOGLE_CLIENT_ID` | `xxxx.apps.googleusercontent.com` | Opcional |

Genera la clave secreta con:
```bash
python3 -c "import secrets; print(secrets.token_urlsafe(64))"
```

> **Importante:** `NEXT_PUBLIC_API_URL` se incrusta en el bundle al construir el
> frontend. Si la cambias, debes reconstruir: `docker compose build web`.

### 4.4 Construir y levantar
```bash
docker compose up -d --build
docker compose ps
docker compose logs -f api   # revisar la carga inicial del catálogo
```

Verifica:
```bash
curl http://localhost:8000/api/health
curl -I http://localhost:3000
```

### 4.5 Nginx y HTTPS
```bash
sudo cp deploy/nginx.conf /etc/nginx/sites-available/plasticosamerica.cl
sudo nano /etc/nginx/sites-available/plasticosamerica.cl   # cambia el dominio
sudo ln -s /etc/nginx/sites-available/plasticosamerica.cl /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx

sudo certbot --nginx -d plasticosamerica.cl -d www.plasticosamerica.cl
```

Certbot renueva el certificado automáticamente. Comprueba con:
```bash
sudo certbot renew --dry-run
```

### 4.6 DNS
En tu proveedor de dominio crea:

| Tipo | Nombre | Valor |
|------|--------|-------|
| A | `@` | IP del VPS |
| A | `www` | IP del VPS |

La propagación puede tardar hasta 24 h (normalmente minutos).

---

## 5. Checklist de seguridad antes de publicar

- [ ] `SECRET_KEY` aleatoria y privada.
- [ ] `ADMIN_PASSWORD` cambiada (o crea otro admin y desactiva el inicial).
- [ ] `POSTGRES_PASSWORD` fuerte.
- [ ] `DEBUG=false` y `ENVIRONMENT=production`.
- [ ] `CORS_ORIGINS` con el dominio real, sin `localhost`.
- [ ] HTTPS activo y renovación automática verificada.
- [ ] Firewall: solo 22, 80 y 443 públicos (`ufw allow ...`); 3000 y 8000 no
      se exponen directamente (Nginx hace el proxy).
- [ ] Copias de seguridad de PostgreSQL programadas (sección 7).
- [ ] Google OAuth con el dominio real en "Orígenes autorizados".

### Cambiar la contraseña del administrador
Desde el panel `/admin` → **Usuarios**, o por consola:
```bash
docker compose exec api python - <<'PY'
from app.database import SessionLocal
from app.models import User
from app.security import hash_password
db = SessionLocal()
u = db.query(User).filter(User.email == "admin@plasticosamerica.cl").first()
u.hashed_password = hash_password("NuevaClaveSegura123!")
db.commit()
print("Contraseña actualizada")
PY
```

---

## 6. Google Sign-In (opcional)

1. Entra a https://console.cloud.google.com/apis/credentials
2. Crea un **ID de cliente OAuth 2.0** de tipo *Aplicación web*.
3. Orígenes JavaScript autorizados:
   - `https://plasticosamerica.cl`
   - `https://www.plasticosamerica.cl`
   - `http://localhost:3000` (solo desarrollo)
4. Copia el Client ID en `GOOGLE_CLIENT_ID` (backend) y reconstruye el backend.
5. Sin esta variable el botón "Continuar con Google" aparece deshabilitado con
   un aviso; el resto del sitio funciona normal.

---

## 7. Copias de seguridad

### Base de datos
```bash
# Respaldo
docker compose exec -T db pg_dump -U plasticos plasticos_america \
  | gzip > respaldo-$(date +%F).sql.gz

# Restauración
gunzip -c respaldo-2026-11-25.sql.gz \
  | docker compose exec -T db psql -U plasticos -d plasticos_america
```

Automatiza con cron (diario a las 03:00):
```
0 3 * * * cd /home/usuario/plasticos-america && docker compose exec -T db pg_dump -U plasticos plasticos_america | gzip > /home/usuario/respaldos/pa-$(date +\%F).sql.gz
```

Guarda los respaldos fuera del servidor (S3, Google Drive, otro VPS).

### Imágenes y catálogo
Las imágenes viven en `frontend/public/productos` y `frontend/public/categorias`
y están versionadas en Git. El catálogo base está en `app/data/catalogo.json`.

---

## 8. Actualizaciones

```bash
cd plasticos-america
git pull
docker compose up -d --build
docker compose logs -f --tail=100 api web
```

Si cambió el catálogo base y la base ya tiene productos, el seed **no**
sobrescribe datos (es idempotente). Para recargar desde cero en un entorno de
pruebas:
```bash
docker compose down -v      # ¡borra la base de datos!
docker compose up -d --build
```

---

## 9. Alternativa: plataformas gestionadas

### Frontend en Vercel
1. Importa el repositorio y selecciona la carpeta `frontend` como raíz.
2. Variable de entorno: `NEXT_PUBLIC_API_URL=https://api.tudominio.cl`.
3. Build: `npm run build`. Framework: Next.js.

### Backend en Railway / Render
1. Nuevo servicio desde el repositorio; Dockerfile en la raíz.
2. Añade PostgreSQL gestionado y copia su `DATABASE_URL`
   (convierte `postgres://` a `postgresql+psycopg2://` si es necesario).
3. Variables: `SECRET_KEY`, `CORS_ORIGINS`, `ADMIN_*`, `GOOGLE_CLIENT_ID`.
4. Comando de arranque ya incluido en el Dockerfile.

Configura `CORS_ORIGINS` con el dominio de Vercel y
`NEXT_PUBLIC_API_URL` con el dominio del backend.

---

## 10. Solución de problemas

| Síntoma | Causa probable | Solución |
|---------|----------------|----------|
| El sitio carga pero no hay productos | API caída o CORS | `docker compose logs api`; revisa `CORS_ORIGINS` |
| "No pudimos conectar con el servidor" | `NEXT_PUBLIC_API_URL` incorrecta | Corrige la variable y `docker compose build web` |
| Login responde 401 | Contraseña o correo incorrectos; usuario inactivo | Revisa en `/admin` → Usuarios |
| El botón de Google está deshabilitado | Falta `GOOGLE_CLIENT_ID` | Configúralo y reconstruye |
| Error `psycopg2` al iniciar | `DATABASE_URL` mal formada | Usa `postgresql+psycopg2://usuario:clave@db:5432/base` |
| Nginx devuelve 502 | Contenedores abajo | `docker compose ps` y `docker compose up -d` |
| Cambios no aparecen | Caché del navegador o build antiguo | Reconstruye y recarga con Ctrl+F5 |

Comandos útiles:
```bash
docker compose ps
docker compose logs -f api
docker compose logs -f web
docker compose exec api python -c "from app.database import engine; print(engine.url)"
docker compose restart api
```

---

## 11. Estructura del proyecto

```
.
├── app/                    # Backend FastAPI
│   ├── api/                # Rutas: auth, productos, cotizaciones, admin
│   ├── data/catalogo.json  # Catálogo base (25 categorías, 624 productos)
│   ├── config.py           # Variables de entorno
│   ├── models.py           # Tablas SQLAlchemy
│   ├── schemas.py          # Contratos Pydantic
│   ├── seed.py             # Carga inicial idempotente
│   └── main.py             # Aplicación
├── frontend/               # Next.js 16 (App Router)
│   ├── public/             # Logo, categorías e imágenes de productos
│   └── src/
│       ├── app/            # Rutas: /, /catalogo, /cuenta, /admin, /boleta…
│       ├── components/     # Navbar, Footer, tarjetas, drawer de cotización
│       ├── data/           # Copia del catálogo para el cliente
│       └── lib/            # API, sesión, cotización, helpers
├── deploy/nginx.conf       # Proxy inverso de ejemplo
├── Dockerfile              # Backend
├── frontend/Dockerfile     # Frontend standalone
├── docker-compose.yml      # PostgreSQL + API + Web
├── .env.example            # Variables documentadas
└── DEPLOY.md               # Este documento
```
