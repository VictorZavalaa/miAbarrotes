# 🛒 Sistema Punto de Venta para Tienda de Abarrotes

Sistema local para tienda física, pensado para operar así:

- **Raspberry Pi**: corre el backend `Node.js + Express` + `MariaDB`
- **Laptop del mostrador**: solo abre el frontend en Chrome y consume la API local

---

## 🧱 Stack actual

| Componente | Tecnología |
|---|---|
| Backend API | Node.js + Express |
| Base de datos | MariaDB |
| Frontend cliente | React + Vite |
| Infra local | Raspberry Pi + red local |

---

## 🧭 Arquitectura objetivo (tienda)

```text
Laptop (Chrome)  --->  API Express en Raspberry  --->  MariaDB en Raspberry
                 (cliente)           (servidor local)               (datos locales)
```

Beneficio: la laptop no necesita instalar backend ni DB; solo acceder por navegador a la Raspberry en la red local.

---

## 📁 Estructura actual

```text
miTienda/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── middleware/
│   │   ├── routes/
│   │   └── utils/
│   ├── tests/
│   ├── scripts/
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   ├── package.json
│   ├── vite.config.js
│   └── .env.example
├── TiendaDB.sql
└── README.md
```

---

## 🗃️ Base de datos (`TiendaDB.sql`)

Esquema MariaDB corregido y ampliado con:

- `products`, `sales`, `sale_items`
- `suppliers`, `supplier_products` (qué trae cada proveedor)
- `purchases`, `purchase_items` (entrada de mercancía)
- `stock_movements` (auditoría de movimientos)
- triggers para:
    - validar y descontar stock al vender
    - incrementar stock al recibir compra de proveedor

---

## 🔌 Endpoints principales

### Salud del sistema
- `GET /api/health`

### Productos
- `GET /api/products`
- `POST /api/products`

### Ventas
- `POST /api/sales`

Este endpoint **registra una venta completa** (cabecera + items) en transacción.
Su función es asegurar que:

1. cada producto exista,
2. haya stock suficiente,
3. se guarde la venta completa,
4. el stock se descuente de forma consistente (con triggers).

### Proveedores
- `GET /api/suppliers`
- `POST /api/suppliers`
- `POST /api/suppliers/:supplierId/products` (asignar productos que maneja el proveedor)

### Compras / entrada de mercancía
- `POST /api/purchases`

Este endpoint registra lo que llega del proveedor y aumenta existencias automáticamente.

---

## ▶️ Arranque local del backend

1. Crear BD con el script `TiendaDB.sql` en MariaDB.
2. Configurar variables en `backend/.env` a partir de `backend/.env.example`.
3. Instalar dependencias y correr.

```bash
cd /Users/victor/Desktop/miTienda/backend
npm install
cp .env.example .env
npm run dev
```

---

## ▶️ Arranque local del frontend

1. Configura URL de API para desarrollo local.
2. Instala dependencias.
3. Arranca Vite.

```bash
cd /Users/victor/Desktop/miTienda/frontend
cp .env.example .env
npm install
npm run dev
```

Frontend disponible en:

- `http://localhost:5173`

---

## 🧪 Flujo de verificación local (rápido)

1. Backend en `http://localhost:3000`
2. Health OK en `http://localhost:3000/api/health`
3. Frontend en `http://localhost:5173`
4. Desde frontend prueba:
    - alta de producto,
    - venta rápida,
    - recepción de compra con proveedor.

---

## ✅ Validación rápida

Prueba automática mínima:

```bash
cd /Users/victor/Desktop/miTienda/backend
npm test
```

Smoke test (requiere servidor encendido):

```bash
cd /Users/victor/Desktop/miTienda/backend
npm run smoke
```

Build frontend:

```bash
cd /Users/victor/Desktop/miTienda/frontend
npm run build
```

---

## 📌 Módulos frontend incluidos

- **Productos**: alta y listado.
- **Venta rápida**: selección de producto, cantidad y método de pago.
- **Recepción proveedor**: alta de proveedor y entrada de mercancía.

Siguiente iteración sugerida: agregar módulo de ticket imprimible y cierre diario de caja.
