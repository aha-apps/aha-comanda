# AHA Comanda 🍽️

Toma de pedidos **offline-first** para restaurantes, bares, pizzerías, taquerías, cocinas económicas y food trucks.

## Características

- **Offline-first**: funciona 100% sin internet (IndexedDB + Service Worker)
- **6 módulos**: Dashboard, Mesas, Comandas, Platillos, Cuentas, Cortes
- **Mapa visual del salón**: mesas con colores por estado (verde=libre, rojo=ocupada, amarillo=cuenta)
- **Split de cuenta**: divide entre N personas, 3 formas de pago (efectivo/tarjeta/transferencia)
- **Corte de caja**: total ventas del día, desglose por forma de pago, top 5 platillos
- **Export**: PDF imprimible tipo ticket + CSV
- **PWA**: instalable en móvil y desktop

## Stack técnico

| Componente | Tecnología |
|------------|-----------|
| UI | Alpine.js 3 + DaisyUI 4 + Tailwind CSS |
| Base de datos | Dexie.js (IndexedDB) |
| Cifrado | CryptoJS |
| Gráficos | Chart.js 4 |
| Perfil actual | Lite (Essential) |

## Perfiles disponibles

| Perfil | Entrega | Precio |
|--------|---------|:------:|
| **Lite** | ZIP + GitHub Pages | Desde $49 |
| **Professional** | .exe + .apk | Desde $99 |
| **Business** | .exe + .apk + white-label | Desde $199 |

## Uso

1. Abre `index.html` en tu navegador (doble clic) o visita [versión online](https://aha-apps.github.io/aha-comanda)
2. Agrega mesas y platillos desde Admin
3. Ocupa una mesa y crea una comanda
4. Agrega platillos con notas y cantidades
5. Cierra la cuenta con split y forma de pago
6. Revisa el corte de caja del día

## Navegación

- **Dashboard**: resumen del día, comandas activas, platillo más vendido
- **Mesas**: mapa visual del salón, ocupar/liberar mesas
- **Comandas**: crear pedidos por mesa con categorías y notas
- **Platillos**: CRUD del menú con toggle disponible
- **Cuentas**: cierre con split y formas de pago
- **Cortes**: corte de caja del día con export

## Licencia

Este producto usa licenciamiento AHA. Genera tu licencia en el meta-repo Ateje con `/licencia`.

## Créditos

Generado con [Ateje Stack](https://github.com/angelcamel/ateje) — Skill-Layer Architecture para apps offline-first.
