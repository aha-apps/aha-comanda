# AHA Comanda — Spec Funcional

## Identidad

- **Nombre:** AHA Comanda
- **Tagline:** Toma pedidos al instante, cocina en orden
- **Color:** #f43f5e (rose-500)
- **Target:** Restaurantes, bares, cafeterías, cocinas económicas
- **Perfil:** Lite (file://, doble clic)

## Stack

- Alpine.js 3 + Dexie 3 + DaisyUI 4 + Tailwind Play CDN + Bootstrap Icons
- ES5 estricto, offline-first, sin servidor
- Chart.js 4 para gráficos en reportes

## DB Schema (Dexie)

```
mesas: ++id, numero, nombre, ubicacion, capacidad, createdBy, createdAt, updatedAt
categorias_producto: ++id, nombre, createdAt
productos_comanda: ++id, categoriaId, nombre, precio, createdBy, createdAt, updatedAt
comandas: ++id, mesaId, mesero, estado, total, createdBy, createdAt, updatedAt
items_comanda: ++id, comandaId, productoId, cantidad, precioUnitario, notas, createdAt
cortes: ++id, fecha, totalEfectivo, totalTarjeta, totalTransferencia, createdBy, createdAt
```

## Módulos

### 1. Mesas (`#/mesas`)
- Mapa visual tipo grid con todas las mesas
- Cada mesa muestra número, nombre y estado (libre/ocupada)
- Al dar clic en mesa ocupada: ver comanda activa
- Al dar clic en mesa libre: nueva comanda
- CRUD de mesas: número, nombre, ubicación (salón/terraza/barra), capacidad

### 2. Comandas (`#/comandas`)
- Nueva comanda: seleccionar mesa + mesero
- Agregar productos: buscador con categorías, selector de cantidad
- Notas por item (opcional)
- Estados: abierta → cerrada
- Total se calcula automáticamente (suma items)
- Historial de comandas con filtros por mesa, mesero, fecha, estado

### 3. Productos (`#/productos`)
- Catálogo con nombre, categoría, precio
- CRUD completo
- Las categorías se gestionan desde el mismo módulo

### 4. Cortes (`#/cortes`)
- Corte de caja diario
- Totales por método de pago: efectivo, tarjeta, transferencia
- Solo un corte por día
- Historial de cortes anteriores

### 5. Reportes (`#/reportes`)
- Dashboard con Chart.js:
  - Ventas del día: total y desglose por método de pago
  - Productos más vendidos: gráfico de barras
  - Ventas por mes: gráfico de líneas
  - Ocupación de mesas: tabla de rendimiento por mesa

## Estilo

- DaisyUI tema rosa (rose-500 como primario)
- Layout: sidebar + contenido principal
- Tablas responsive con scroll horizontal en móvil
- Formularios en modal (UI.modalForm)
- Toasts para feedback de operaciones
