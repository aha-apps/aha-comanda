// db.js — Inicialización Dexie con tablas de AHA Comanda
// window.db expuesto globalmente
// Dependencias: Dexie.js, APP_CONFIG

(function () {
  'use strict';

  if (typeof window.db !== 'undefined') return;

  var DB_NAME = 'aha-comanda';

  var schema = {};

  // Tablas de sistema
  schema._sync_log = 'id, *tabla, *operacion, *idRegistro, *estado, *fecha, *createdBy, createdAt';
  schema._ia_chats = 'id, *titulo, *modelo, *createdBy, createdAt, updatedAt';
  schema._ia_messages = 'id, *chatId, *rol, contenido, *createdBy, createdAt';
  schema._files = '&path, tipo, nombre, mime, size, hash, refCount, createdAt, updatedAt';

  // Tablas de negocio
  schema.mesas = 'id, nombre, *capacidad, estado, ubicacion, createdAt, updatedAt';
  schema.categorias = 'id, nombre, color, orden, createdAt, updatedAt';
  schema.platillos = 'id, nombre, *categoriaId, precio, disponible, imagen, createdAt, updatedAt';
  schema.comandas = 'id, *mesaId, *estado, items, total, numComensales, notas, createdAt, updatedAt';
  schema.cuentas = 'id, *comandaId, total, split, formaPago, createdAt, updatedAt';
  schema.cortes = 'id, fecha, totalVentas, numComandas, ticketPromedio, porFormaPago, platillosVendidos, createdAt, updatedAt';

  // En perfil Lite, tabla de blobs para file://
  if (!window.NL_OS && !window.Capacitor) {
    schema._file_blobs = '&path';
  }

  var db = new Dexie(DB_NAME);

  window.DB_VERSION = 2;

  db.version(1).stores({
    mesas: 'id, nombre, *capacidad, estado, ubicacion, createdAt, updatedAt',
    categorias: 'id, nombre, color, orden, createdAt, updatedAt',
    platillos: 'id, nombre, *categoriaId, precio, disponible, imagen, createdAt, updatedAt',
    comandas: 'id, *mesaId, *estado, items, total, numComensales, notas, createdAt, updatedAt',
    cuentas: 'id, *comandaId, total, split, formaPago, createdAt, updatedAt',
    cortes: 'id, fecha, totalVentas, numComandas, ticketPromedio, porFormaPago, platillosVendidos, createdAt, updatedAt'
  });

  db.version(2).stores({
    mesas: 'id, nombre, *capacidad, estado, ubicacion, createdAt, updatedAt',
    categorias: 'id, nombre, color, orden, createdAt, updatedAt',
    platillos: 'id, nombre, *categoriaId, precio, disponible, imagen, createdAt, updatedAt',
    comandas: 'id, *mesaId, *estado, items, total, numComensales, notas, createdAt, updatedAt',
    cuentas: 'id, *comandaId, total, split, formaPago, createdAt, updatedAt',
    cortes: 'id, fecha, totalVentas, numComandas, ticketPromedio, porFormaPago, platillosVendidos, createdAt, updatedAt',
    _sync_log: 'id, *tabla, *operacion, *idRegistro, *estado, *fecha, *createdBy, createdAt',
    _ia_chats: 'id, *titulo, *modelo, *createdBy, createdAt, updatedAt',
    _ia_messages: 'id, *chatId, *rol, contenido, *createdBy, createdAt',
    _files: '&path, tipo, nombre, mime, size, hash, refCount, createdAt, updatedAt'
  });

  // Lite: aÃ±adir blobs
  if (!window.NL_OS && !window.Capacitor) {
    try {
      db.version(3).stores({
        _file_blobs: '&path'
      });
    } catch (e) {}
  }

  window.db = db;
  console.log('[db] Inicializado: ' + DB_NAME);
})();
