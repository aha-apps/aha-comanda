// file-store.js — GestiÃ³n unificada de archivos (avatares, fotos, docs)
// Backend Lite: Dexie blobs
// window.FileStore expuesto globalmente

(function () {
  'use strict';

  if (typeof window.FileStore !== 'undefined') return;

  var PERFIL = window.APP_CONFIG && window.APP_CONFIG.perfil || 'lite';
  var DIR = window.APP_CONFIG && window.APP_CONFIG.data && window.APP_CONFIG.data.dir || 'data/';
  var MAX_SIZE = window.APP_CONFIG && window.APP_CONFIG.data && window.APP_CONFIG.data.maxFileSize || 10 * 1024 * 1024;
  var objectUrls = {};

  function readAsArrayBuffer(blob) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () { resolve(reader.result); };
      reader.onerror = reject;
      reader.readAsArrayBuffer(blob);
    });
  }

  window.FileStore = {
    APP_DATA_DIR: DIR,

    save: function (tipo, nombre, blob) {
      if (blob.size > MAX_SIZE) {
        var maxMB = Math.round(MAX_SIZE / 1024 / 1024);
        return Promise.reject(new Error('Archivo excede ' + maxMB + 'MB'));
      }
      var ext = nombre.split('.').pop();
      var id = window.uuid();
      var path = tipo + '/' + id + '.' + ext;

      return db._files.put({
        path: path, tipo: tipo, nombre: nombre, mime: blob.type, size: blob.size, hash: '',
        refCount: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
      }).then(function () {
        if (PERFIL === 'lite') {
          return db._file_blobs.put({ path: path, blob: blob });
        }
        return Promise.resolve();
      }).then(function () {
        var url = URL.createObjectURL(blob);
        objectUrls[path] = url;
        return { path: path, hash: '', url: url };
      }).catch(function (e) {
        return db._files.delete(path).then(function () {
          throw e;
        });
      });
    },

    getURL: function (path) {
      if (!path) return Promise.resolve(null);
      if (objectUrls[path]) return Promise.resolve(objectUrls[path]);
      if (PERFIL === 'lite') {
        return db._file_blobs.get(path).then(function (entry) {
          if (!entry || !entry.blob) return null;
          var url = URL.createObjectURL(entry.blob);
          objectUrls[path] = url;
          return url;
        });
      }
      return Promise.resolve(null);
    },

    read: function (path) {
      if (!path) return Promise.resolve(null);
      if (PERFIL === 'lite') {
        return db._file_blobs.get(path).then(function (entry) {
          return entry ? entry.blob : null;
        });
      }
      return Promise.resolve(null);
    },

    'delete': function (path) {
      if (!path) return Promise.resolve();
      if (objectUrls[path]) {
        URL.revokeObjectURL(objectUrls[path]);
        delete objectUrls[path];
      }
      var chain = Promise.resolve();
      if (PERFIL === 'lite') {
        chain = db._file_blobs.delete(path);
      }
      return chain.then(function () {
        return db._files.delete(path);
      });
    },

    meta: function (path) {
      return path ? db._files.get(path) : Promise.resolve(null);
    },

    avatarDefault: function () {
      return 'data/defaults/avatar.svg';
    }
  };
})();
