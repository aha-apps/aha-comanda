// project.config.js — ConfiguraciÃ³n de AHA Comanda
window.APP_CONFIG = {
  app: { id: 'aha-comanda', nombre: 'AHA Comanda', version: '1.0.0' },
  perfil: 'lite',
  iaJutia: { perfil: 'lite' },
  modulosActivos: ['dashboard', 'mesas', 'comandas', 'platillos', 'cuentas', 'cortes'],
  modulos: {
    dashboard: { titulo: 'Dashboard', icono: 'bi bi-speedometer2', activo: true },
    mesas: { titulo: 'Mesas', icono: 'bi bi-grid-3x3-gap', activo: true },
    comandas: { titulo: 'Comandas', icono: 'bi bi-receipt', activo: true },
    platillos: { titulo: 'Platillos', icono: 'bi bi-cup-straw', activo: true },
    cuentas: { titulo: 'Cuentas', icono: 'bi bi-credit-card-2-back', activo: true },
    cortes: { titulo: 'Cortes', icono: 'bi bi-cash-stack', activo: true }
  },
  tema: { modo: 'light', colores: { primary: '#b91c1c', secondary: '#78716c', accent: '#f59e0b' } },
  cifrado: { camposSensibles: [] },
  ui: { formsMode: 'modal', alerts: 'toast', confirmDelete: true, avatars: false },
  data: { dir: 'data/', maxFileSize: 10485760, avatars: { default: 'data/defaults/avatar.svg' } },
  sync: { primaryFormat: 'json', encrypt: true }
};
