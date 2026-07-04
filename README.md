# AHA Comanda — Toma de pedidos offline para restaurantes

Sistema de comandas offline-first para restaurantes, bares y cocinas. Funciona sin internet, sin servidores, sin mensualidades.

## Perfil
- **Lite**: ZIP + GitHub Pages
- IA Jutía: Lite (FlexSearch)

## Módulos
- **Dashboard**: Panel resumen con stats y gráfico Chart.js
- **Mesas**: Gestión de mesas con mapa visual del salón (verde=libre, rojo=ocupada, amarillo=cuenta)
- **Comandas**: Crear comandas por mesa, agregar platillos por categoría, notas, historial
- **Platillos**: CRUD con categorías, precios, toggle disponible
- **Cuentas**: Cerrar comandas, split N personas, formas de pago
- **Cortes**: Corte de caja del día, export PDF y CSV

## Stack
- Alpine.js + DaisyUI + Bootstrap Icons
- Dexie.js (IndexedDB)
- CryptoJS (cifrado local)
- Chart.js (gráficos)
- PWA (Service Worker + Manifest)
