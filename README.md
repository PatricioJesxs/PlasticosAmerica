# Plásticos América — Sitio web y catálogo

Sitio corporativo y catálogo de Plásticos América (Santiago, Chile), con
cotizaciones en línea, cuentas de clientes y panel de administración para el
equipo de ventas.

![Stack](https://img.shields.io/badge/Next.js-16-black) ![API](https://img.shields.io/badge/FastAPI-0.110-009688) ![DB](https://img.shields.io/badge/PostgreSQL-16-336791)

---

## Qué incluye

- **Catálogo real** de 25 líneas y 624 productos, con 3.770 variantes de medida,
  SKU, precio neto, stock y unidad. Imágenes locales de productos y categorías.
- **Buscador y filtros** por línea, categoría, medida, SKU y orden de precio.
- **Cotizador** con carrito persistente, cálculo de IVA y envío real a la API
  (folio automático).
- **Cuentas de usuario**: registro con correo/RUT y contraseña, inicio de sesión
  y acceso con Google (opcional).
- **Panel de trabajadores** (`/admin`): resumen de ventas cotizadas, CRUD de
  productos y medidas, gestión de cotizaciones y estados, usuarios y roles, y
  registro de auditoría.
- **Páginas institucionales**: inicio, nosotros, mayorista, contacto con mapa,
  consulta de boleta electrónica.
- **Diseño responsive** con animaciones, marca rojo `#8B0000` y azul marino
  `#0D233A`.

---

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4 |
| Backend | FastAPI, SQLAlchemy 2, Pydantic 2, JWT, bcrypt |
| Base de datos | SQLite (desarrollo) / PostgreSQL 16 (producción) |
| Despliegue | Docker Compose + Nginx + Certbot |

---

## Inicio rápido (desarrollo)

### Backend
```bash
python -m venv venv
venv\Scripts\activate          # Linux/macOS: source venv/bin/activate
pip install -r requirements.txt
copy .env.example .env         # Linux/macOS: cp .env.example .env
uvicorn app.main:app --reload --port 8000
```
API: http://localhost:8000 · Docs: http://localhost:8000/docs

El primer arranque crea las tablas, carga el catálogo y crea el administrador.

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Sitio: http://localhost:3000

### Acceso de administrador
```
Correo:     admin@plasticosamerica.cl
Contraseña: Admin1234!
```
Cámbialas antes de publicar.

---


---

## Scripts útiles

| Comando | Descripción |
|---------|-------------|
| `uvicorn app.main:app --reload` | Backend en desarrollo |
| `python -m app.seed` | Carga/verifica catálogo y admin |
| `npm run dev` (en `frontend/`) | Frontend en desarrollo |
| `npm run build` | Build de producción del frontend |
| `npx tsc --noEmit` | Verificación de tipos |
| `docker compose up -d --build` | Stack completo en producción |

---

## Documentación

- **[DEPLOY.md](./DEPLOY.md)** — publicación en VPS, Docker, dominio, HTTPS,
  respaldos y solución de problemas. Incluye una advertencia importante sobre
  los hostings compartidos de WordPress.
- **[docs/MANUAL-ADMIN.md](./docs/MANUAL-ADMIN.md)** — manual del panel de
  administración para el equipo de ventas.

---

## Notas

- Los **precios del catálogo son referenciales** (netos, sin IVA) y deben
  ajustarse desde `/admin` antes de publicar. El backend recalcula el IVA (19 %).
- Google Sign-In requiere `GOOGLE_CLIENT_ID`; sin él el botón queda deshabilitado
  y el resto funciona con correo/contraseña.
- Las contraseñas se almacenan con bcrypt; los tokens son JWT con expiración
  configurable.
