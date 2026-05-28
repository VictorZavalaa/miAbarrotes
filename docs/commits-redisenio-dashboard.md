# Registro de commits del redisenio

Este documento resume los cambios hechos durante el redisenio inicial del sistema POS.

## a73c2d6 - feat(frontend): add operational alerts panel

Agrega un panel de alertas operativas al inicio.

Alertas incluidas:

- Pagos de proveedor pendientes para hoy.
- Productos con bajo stock.
- Productos con informacion incompleta en catalogo.
- Corte de caja pendiente cuando hay monto registrado y no hay corte del dia.

Cambios principales:

- `frontend/src/App.jsx`: pasa `products` al dashboard para poder calcular alertas de inventario/catalogo.
- `frontend/src/operations/DashboardSection.jsx`: calcula alertas y agrega el panel `Atencion`.
- `frontend/src/styles.css`: estilos responsive, modo oscuro y colores por prioridad para alertas.
- `frontend/dist`: build regenerado para produccion.

Resultado esperado:

- El inicio muestra avisos accionables sin entrar a cada modulo.
- Bajo stock lista los primeros productos mas urgentes.
- Catalogo incompleto permite saltar directo a Productos.

## aef267e - feat(frontend): add dashboard quick actions

Agrega acciones rapidas al inicio del dashboard:

- Nueva venta.
- Agregar producto.
- Proveedor.
- Corte de caja.

Cambios principales:

- `frontend/src/App.jsx`: pasa la funcion de navegacion al dashboard.
- `frontend/src/operations/DashboardSection.jsx`: agrega el panel de acciones rapidas.
- `frontend/src/styles.css`: estilos responsive y modo oscuro para las acciones.
- `frontend/dist`: build regenerado para produccion.

Resultado esperado:

- Desde Inicio se puede saltar directo a Venta rapida, Productos y Proveedores.
- El boton Corte de caja usa el flujo existente.

## 5031eed - fix(frontend): derive api url from current host

Corrige el problema de que el frontend compilado apuntara a `localhost:3000`.

Cambios principales:

- `frontend/src/api.js`: si no existe `VITE_API_URL`, calcula automaticamente la API con el host actual:
  `http://<host-actual>:3000/api`.
- `frontend/.env.example`: documenta que `VITE_API_URL` es opcional.
- `frontend/dist`: build regenerado.

Resultado esperado:

- En Raspberry, si se abre `http://192.168.1.86`, el frontend llama automaticamente a
  `http://192.168.1.86:3000/api`.
- Ya no hace falta compilar manualmente con una IP fija para evitar `localhost`.

Verificacion recomendada:

```bash
grep -Roh "localhost:3000\|location.hostname" frontend/dist/assets/*.js | sort -u
```

Debe aparecer `location.hostname` y no debe aparecer `localhost:3000`.

## 71ff0f6 - feat(frontend): polish dashboard layout

Pulido visual del dashboard despues del primer redisenio.

Cambios principales:

- `frontend/src/components/TopBar.jsx`: cambia `Refrescar datos` por un boton mas compacto `Refrescar`.
- `frontend/src/styles.css`: reduce espacios, compacta tarjetas, mejora inputs/selects y afina modo oscuro.
- `frontend/dist`: build regenerado.

Resultado esperado:

- Barra superior menos pesada.
- Calendario, agenda y tarjetas con menor altura visual.
- Selects mas consistentes con el tema oscuro.

## 2d7e308 - feat(frontend): redesign dashboard home

Primer redisenio grande del inicio/dashboard.

Cambios principales:

- `frontend/src/App.jsx`: reorganiza el layout en una estructura con navegacion lateral y area principal.
- `frontend/src/components/PageHeader.jsx`: cambia textos y estilo general del encabezado.
- `frontend/src/components/TopBar.jsx`: limpia iconos/emojis y simplifica textos operativos.
- `frontend/src/operations/DashboardSection.jsx`: transforma el dashboard en centro operativo.
- `frontend/src/styles.css`: agrega la nueva direccion visual tipo POS.
- `frontend/dist`: build regenerado para produccion.

Resultado esperado:

- Inicio mas serio y operativo.
- Menu lateral en desktop.
- Resumen principal con ventas, saldo despues de pagos, pagos de hoy, bajo stock, caja, calendario y agenda.

## Flujo de despliegue usado en Raspberry

Comandos base:

```bash
cd /opt/miTienda
git pull origin main
sudo systemctl reload nginx
```

Si hay cambios locales en `frontend/dist`, primero guardar esos cambios:

```bash
git stash push -m "dist local antes de update" -- frontend/dist/index.html frontend/dist/assets || true
git pull origin main
sudo systemctl reload nginx
```

Si se sospecha cache en Safari:

```text
http://192.168.1.86/?v=3
```

## Validaciones usadas antes de subir

```bash
cd frontend
npm run build

cd ../backend
npm test
```
