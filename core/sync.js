// sync.js — Export/Import de datos en formato .ateje-backup
// Dependencias: JSZip, CryptoJS, pako

(function () {
  'use strict';

  if (typeof window.SyncEngine !== 'undefined') return;

  var EXCLUDE_TABLES = ['modelos_cache', '_ia_sqlite', '_file_blobs'];

  window.SyncEngine = {
    _password: '',

    setPassword: function (pwd) {
      this._password = pwd || '';
    },

    exportar: function (password) {
      var pwd = password || this._password;
      var self = this;
      try {
        UI.toast('Preparando respaldo...', 'info');
        var tables = {};
        var recordCount = 0;
        var dbRef = window.db;
        var appName = 'AHA Comanda';
        var steps = [];

        var dbTables = dbRef && dbRef.tables ? dbRef.tables : [];
        for (var i = 0; i < dbTables.length; i++) {
          (function (table) {
            if (EXCLUDE_TABLES.indexOf(table.name) !== -1) return;
            if (table.name === '_files' || table.name === '_file_blobs') return;
            steps.push(
              table.toArray().then(function (records) {
                if (records.length) {
                  tables[table.name] = records;
                  recordCount += records.length;
                }
              })
            );
          })(dbTables[i]);
        }

        return Promise.all(steps).then(function () {
          var data = {
            version: 2,
            app: appName,
            exportedAt: new Date().toISOString(),
            recordCount: recordCount,
            tables: tables
          };
          var json = JSON.stringify(data, null, 2);
          var finalData;

          if (pwd) {
            finalData = CryptoJS.AES.encrypt(json, pwd).toString();
          } else {
            try {
              if (window.pako) {
                finalData = pako.gzip(json);
              } else {
                finalData = json;
              }
            } catch (e) {
              finalData = json;
            }
          }

          var blob;
          if (typeof finalData === 'string') {
            blob = new Blob([finalData], { type: 'application/octet-stream' });
          } else {
            blob = new Blob([finalData], { type: 'application/octet-stream' });
          }

          var url = URL.createObjectURL(blob);
          var a = document.createElement('a');
          a.href = url;
          var timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          a.download = 'AHA-Comanda-' + timestamp + '.ateje-backup';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          UI.toast('Respaldo exportado correctamente', 'success');
          return true;
        }).catch(function (err) {
          UI.toast('Error al exportar: ' + (err.message || 'Error desconocido'), 'error');
          throw err;
        });
      } catch (err) {
        UI.toast('Error al exportar: ' + (err.message || 'Error desconocido'), 'error');
        return Promise.reject(err);
      }
    },

    importar: function (file, password) {
      var self = this;
      try {
        UI.toast('Importando respaldo...', 'info');
        return new Promise(function (resolve, reject) {
          var reader = new FileReader();
          reader.onload = function () {
            var content = reader.result;
            var json;
            if (password) {
              try {
                var decrypted = CryptoJS.AES.decrypt(content, password).toString(CryptoJS.enc.Utf8);
                if (!decrypted) throw new Error('ContraseÃ±a incorrecta');
                json = JSON.parse(decrypted);
              } catch (e) {
                UI.toast('ContraseÃ±a incorrecta o archivo corrupto', 'error');
                reject(e);
                return;
              }
            } else {
              try {
                json = JSON.parse(content);
              } catch (e) {
                try {
                  var decompressed = pako.ungzip(content, { to: 'string' });
                  json = JSON.parse(decompressed);
                } catch (e2) {
                  UI.toast('Formato de respaldo invÃ¡lido', 'error');
                  reject(new Error('Invalid format'));
                  return;
                }
              }
            }

            if (!json || !json.tables) {
              UI.toast('Formato de respaldo invÃ¡lido', 'error');
              reject(new Error('Invalid format'));
              return;
            }

            var tableNames = Object.keys(json.tables);
            var ps = [];
            var dbRef = window.db;
            if (!dbRef) {
              UI.toast('Base de datos no disponible', 'error');
              reject(new Error('No DB'));
              return;
            }

            for (var i = 0; i < tableNames.length; i++) {
              (function (tableName) {
                var records = json.tables[tableName];
                if (!records || !records.length) return;
                var tableArr = dbRef.tables;
                var targetTable = null;
                for (var t = 0; t < tableArr.length; t++) {
                  if (tableArr[t].name === tableName) {
                    targetTable = tableArr[t];
                    break;
                  }
                }
                if (targetTable) {
                  ps.push(targetTable.bulkPut(records));
                }
              })(tableNames[i]);
            }

            Promise.all(ps).then(function () {
              UI.toast('Respaldo importado correctamente (' + json.recordCount + ' registros)', 'success');
              resolve(true);
            }).catch(function (err) {
              UI.toast('Error al importar datos: ' + (err.message || 'Error'), 'error');
              reject(err);
            });
          };
          reader.onerror = function () { reject(new Error('Error al leer archivo')); };
          reader.readAsText(file);
        });
      } catch (err) {
        UI.toast('Error al importar: ' + (err.message || 'Error'), 'error');
        return Promise.reject(err);
      }
    }
  };
})();
