# Manual del panel de administración

Guía para el equipo de Plásticos América. El panel está en:

```
https://TU-DOMINIO/admin
```

Solo pueden entrar usuarios con rol **ADMIN** o **VENDEDOR**. Si una cuenta no
tiene permisos, el panel muestra un aviso y no permite gestionar nada.

---

## 1. Ingresar

1. Entra a `/login`.
2. Usa tu correo corporativo y contraseña.
3. Si ya tienes la sesión abierta, visita `/admin` directamente.

Roles disponibles:

| Rol | Puede |
|-----|-------|
| `ADMIN` | Todo: productos, cotizaciones, usuarios, roles y auditoría |
| `VENDEDOR` | Productos, cotizaciones y consulta de usuarios |
| `MAYORISTA` | Comprar/cotizar con condiciones mayoristas; sin panel |
| `CLIENTE` | Comprar/cotizar; sin panel |

Un administrador puede crear cuentas de trabajador desde **Usuarios → Nuevo
trabajador**. Entrega la contraseña inicial por un canal seguro y pide cambiarla.

---

## 2. Resumen

La pestaña **Resumen** muestra:

- Productos activos en el catálogo.
- Total de cotizaciones y cuántas están pendientes.
- Monto total cotizado (con IVA).
- Últimas cotizaciones con su estado.
- Accesos rápidos para crear productos, revisar cotizaciones o crear
  trabajadores.

El botón **Actualizar** recarga las cifras.

---

## 3. Productos

### Buscar
Usa el buscador por nombre, SKU o medida y el filtro por línea. La tabla muestra
producto, categoría, cantidad de medidas, precio desde y estado.

### Crear un producto
1. **Nuevo producto**.
2. Completa nombre y SKU (se genera uno automáticamente; puedes cambiarlo).
3. Elige categoría, unidad base y etiqueta (Nuevo / Más vendido).
4. Agrega una o más **medidas** con precio neto, stock y unidad.
5. Guarda. El producto aparece de inmediato en el catálogo público.

> El precio que ingresas es **neto**. El sitio y las cotizaciones agregan IVA
> (19 %) automáticamente.

### Editar
Pulsa el lápiz en la fila. Puedes cambiar nombre, categoría, descripción,
etiqueta, destacado, estado activo y cada medida/precio/stock.

### Desactivar
El icono de papelera **no borra** el producto: lo desactiva para que deje de
mostrarse en el catálogo público. Puedes reactivarlo editándolo y marcando
"Activo en el catálogo".

### Ver en el sitio
El icono del ojo abre la ficha pública del producto.

---

## 4. Cotizaciones

Cada solicitud enviada desde el sitio aparece aquí con folio, cliente, fecha,
ítems y totales.

### Revisar una cotización
Pulsa la fila para expandir: RUT, teléfono, correo, comentarios del cliente y
detalle de ítems con neto, IVA y total.

### Cambiar el estado
Usa el selector de estado:

| Estado | Cuándo usarlo |
|--------|---------------|
| `PENDIENTE` | Recién recibida, sin revisar |
| `EN REVISION` | Estás preparando la respuesta |
| `RESPONDIDA` | Ya enviaste la cotización al cliente |
| `APROBADA` | El cliente aceptó |
| `RECHAZADA` | El cliente no siguió adelante |

El contador rojo junto a la pestaña indica cuántas están pendientes o en
revisión.

### Responder
El botón **Responder por correo** abre tu cliente de email con el asunto y
destinatario ya completados.

---

## 5. Usuarios

Lista de todas las cuentas registradas (clientes y trabajadores).

- **Buscar** por nombre, correo o RUT.
- **Rol**: cambia entre Cliente, Mayorista, Vendedor y Admin. No puedes cambiar
  tu propio rol.
- **Activo/Inactivo**: desactiva una cuenta para impedir el acceso sin borrarla.
  No puedes desactivar tu propia cuenta.
- **Acceso**: indica si la cuenta usa correo/contraseña o Google.
- **Último ingreso**: fecha del último inicio de sesión.

> Los clientes que se registran solos entran como `CLIENTE`. Si un cliente
> compra al por mayor de forma recurrente, cambia su rol a `MAYORISTA`.

---

## 6. Auditoría

Registro de los últimos 150 eventos: inicios de sesión, creación de usuarios,
cambios de productos y cotizaciones, con fecha y dirección IP. Sirve para
revisar quién hizo qué ante una discrepancia.

---

## 7. Buenas prácticas

- Revisa **Cotizaciones pendientes** al inicio y al final de cada día.
- Mantén los precios y el stock actualizados: el catálogo público los muestra en
  tiempo real.
- Antes de desactivar un producto, verifica que no esté en cotizaciones abiertas.
- No compartas cuentas de administrador; crea una por trabajador.
- Si un trabajador deja la empresa, desactiva su cuenta en **Usuarios**.

---

## 8. Problemas frecuentes

| Problema | Solución |
|----------|----------|
| No veo el panel | Tu cuenta no es ADMIN/VENDEDOR; pide el cambio a un administrador |
| "No pudimos conectar con el servidor" | La API está caída o la URL es incorrecta; avisa a soporte técnico |
| Un cambio no aparece en el sitio | Recarga con Ctrl+F5; si persiste, avisa a soporte |
| No puedo cambiar mi propio rol/estado | Es intencional, para evitar bloqueos |
| Una cotización no llega | Revisa la pestaña Cotizaciones; el folio se genera al enviar |

Soporte técnico: revisar `DEPLOY.md` (sección 10) o los registros del servidor.
