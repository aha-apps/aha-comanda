// comandas/module.js — CreaciÃ³n y gestiÃ³n de comandas
(function () {
  'use strict';

  var Comandas = {
    id: 'comandas',
    titulo: 'Comandas',
    icono: 'bi bi-receipt',

    mesaSeleccionada: null,
    comandaActiva: null,
    itemsComanda: [],
    categorias: [],
    platillos: [],

    init: function () {
      console.log('[comandas] Inicializado');
      this.cargarCatalogos();
    },

    render: function (params) {
      var mesaId = params && params.mesaId || null;
      var comandaId = params && params.comandaId || null;

      return '<div x-data="comandasData()" x-init="init(' + JSON.stringify(mesaId) + ', ' + JSON.stringify(comandaId) + ')">' +
        '<h2 class="text-2xl font-bold mb-4 flex items-center gap-2">' +
          '<i class="bi bi-receipt"></i> Comandas</h2>' +

        '<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">' +

          // Columna izquierda: Selector de mesa + categorÃ­as
          '<div class="lg:col-span-2 space-y-4">' +
            '<div class="bg-base-100 rounded-box shadow-sm p-4">' +
              '<h3 class="font-semibold mb-3 flex items-center gap-2"><i class="bi bi-grid-3x3-gap"></i> Seleccionar mesa</h3>' +
              '<div class="flex flex-wrap gap-2">' +
                '<template x-for="mesa in mesasDisponibles" :key="mesa.id">' +
                  '<button @click="seleccionarMesa(mesa)" class="btn btn-sm" ' +
                          ':class="mesaSeleccionada && mesaSeleccionada.id === mesa.id ? \'btn-primary\' : \'btn-ghost border\'" ' +
                          ':style="\'border-color: \' + colorEstado(mesa.estado)">' +
                    '<span x-text="mesa.nombre"></span>' +
                    '<span class="text-xs opacity-60" x-text="mesa.estado"></span>' +
                  '</button>' +
                '</template>' +
              '</div>' +
              '<div x-show="mesasDisponibles.length === 0" class="text-sm text-base-content/50 text-center py-4">' +
                'No hay mesas. Crea una en el mÃ³dulo Mesas.</div>' +
            '</div>' +

            <div class="bg-base-100 rounded-box shadow-sm p-4">' +
              '<h3 class="font-semibold mb-3 flex items-center gap-2"><i class="bi bi-list-ul"></i> CategorÃ­as</h3>' +
              '<div class="flex flex-wrap gap-2">' +
                '<button @click="categoriaSel = null" class="btn btn-sm" ' +
                        ':class="categoriaSel === null ? \'btn-primary\' : \'btn-ghost\'">Todas</button>' +
                '<template x-for="cat in categorias" :key="cat.id">' +
                  '<button @click="categoriaSel = cat.id" class="btn btn-sm" ' +
                          ':class="categoriaSel === cat.id ? \'btn-primary\' : \'btn-ghost\'" ' +
                          'x-text="cat.nombre"></button>' +
                '</template>' +
              '</div>' +
            '</div>' +

            <div class="bg-base-100 rounded-box shadow-sm p-4">' +
              '<h3 class="font-semibold mb-3 flex items-center gap-2"><i class="bi bi-cup-straw"></i> Platillos</h3>' +
              '<input type="search" x-model="busquedaPlatillo" placeholder="Buscar platillo..." ' +
                     'class="input input-bordered w-full mb-3" />' +
              '<div class="grid grid-cols-2 sm:grid-cols-3 gap-2">' +
                '<template x-for="plat in platillosFiltrados" :key="plat.id">' +
                  '<button @click="agregarItem(plat)" x-show="plat.disponible !== false" ' +
                          'class="btn btn-ghost border border-base-300 btn-sm h-auto py-3 flex-col items-center gap-1"' +
                          ':disabled="!mesaSeleccionada">' +
                    '<span class="font-medium text-sm" x-text="plat.nombre"></span>' +
                    '<span class="text-xs text-primary font-semibold" x-text="UI.formatCurrency(plat.precio)"></span>' +
                  '</button>' +
                '</template>' +
              '</div>' +
              '<div x-show="platillosFiltrados.length === 0" class="text-sm text-base-content/50 text-center py-4">' +
                'No hay platillos en esta categorÃ­a</div>' +
            '</div>' +
          '</div>' +

          // Columna derecha: Comanda activa
          '<div class="space-y-4">' +
            '<div class="bg-base-100 rounded-box shadow-sm p-4 sticky top-20">' +
              '<h3 class="font-semibold mb-3 flex items-center gap-2">' +
                '<i class="bi bi-bag-check"></i> Comanda' +
                '<span x-show="mesaSeleccionada" class="badge badge-primary badge-sm" x-text="\'Mesa \' + mesaSeleccionada.nombre"></span>' +
              '</h3>' +

              '<div x-show="mesaSeleccionada" class="space-y-2">' +
                '<label class="form-control w-full">' +
                  '<span class="label-text">Comensales</span>' +
                  '<input type="number" x-model="numComensales" class="input input-bordered input-sm" min="1" max="99" />' +
                '</label>' +
                '<label class="form-control w-full">' +
                  '<span class="label-text">Notas generales</span>' +
                  '<textarea x-model="notasComanda" class="textarea textarea-bordered textarea-sm" placeholder="Notas para cocina..."></textarea>' +
                '</label>' +
              '</div>' +

              <div class="divide-y divide-base-200 mt-3">' +
                '<template x-for="(item, i) in itemsComanda" :key="i">' +
                  '<div class="flex items-center gap-2 py-2">' +
                    '<div class="flex-1 min-w-0">' +
                      '<div class="text-sm font-medium truncate" x-text="item.nombre"></div>' +
                      '<div class="text-xs text-base-content/50">' +
                        '<span x-text="\'x\' + item.cantidad"></span> Ã— ' +
                        '<span x-text="UI.formatCurrency(item.precioUnitario)"></span>' +
                      '</div>' +
                      '<div x-show="item.notas" class="text-xs italic text-base-content/40" x-text="item.notas"></div>' +
                    '</div>' +
                    '<div class="text-sm font-semibold" x-text="UI.formatCurrency(item.subtotal)"></div>' +
                    '<button @click="quitarItem(i)" class="btn btn-ghost btn-xs btn-square text-error">' +
                      '<i class="bi bi-x"></i>' +
                    '</button>' +
                  '</div>' +
                '</template>' +
              '</div>' +

              '<div x-show="itemsComanda.length === 0 && mesaSeleccionada" class="text-sm text-base-content/40 text-center py-4">' +
                'Agrega platillos desde la izquierda</div>' +

              '<div x-show="itemsComanda.length > 0" class="border-t border-base-200 pt-3 mt-3">' +
                '<div class="flex justify-between font-bold text-lg">' +
                  '<span>Total</span>' +
                  '<span class="text-primary" x-text="UI.formatCurrency(totalComanda)"></span>' +
                '</div>' +

                '<div class="flex gap-2 mt-3">' +
                  '<button @click="guardarComanda(true)" class="btn btn-primary flex-1 btn-sm" :disabled="itemsComanda.length === 0">' +
                    '<i class="bi bi-check-lg"></i> Cerrar comanda' +
                  '</button>' +
                  '<button @click="guardarComanda(false)" class="btn btn-ghost btn-sm" :disabled="itemsComanda.length === 0">' +
                    'Solo guardar' +
                  '</button>' +
                '</div>' +
              '</div>' +

              '<div x-show="!mesaSeleccionada" class="text-center py-8 text-base-content/40">' +
                '<i class="bi bi-hand-index text-4xl mb-2 block"></i>' +
                '<p class="text-sm">Selecciona una mesa para empezar</p>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +

        // Historial de comandas
        '<div class="mt-8 bg-base-100 rounded-box shadow-sm p-4">' +
          '<h3 class="font-semibold mb-3 flex items-center gap-2">' +
            '<i class="bi bi-clock-history"></i> Historial de comandas cerradas</h3>' +
          '<input type="date" x-model="filtroFecha" class="input input-bordered input-sm mb-3" />' +
          '<div class="overflow-x-auto">' +
            '<table class="table table-zebra table-sm">' +
              '<thead>' +
                '<tr><th>Mesa</th><th>Items</th><th>Total</th><th>Fecha</th></tr>' +
              '</thead>' +
              '<tbody>' +
                '<template x-for="com in historial" :key="com.id">' +
                  '<tr>' +
                    '<td x-text="com.mesaNombre || com.mesaId"></td>' +
                    '<td x-text="com.numItems || 0"></td>' +
                    '<td x-text="UI.formatCurrency(com.total)"></td>' +
                    '<td x-text="UI.formatDate(com.createdAt)"></td>' +
                  '</tr>' +
                '</template>' +
              '</tbody>' +
            '</table>' +
          '</div>' +
          '<div x-show="historial.length === 0 && !cargandoHistorial" class="text-sm text-base-content/50 text-center py-4">' +
            'No hay comandas cerradas en esta fecha</div>' +
        '</div>' +
      '</div>';
    },

    destroy: function () {},

    cargarCatalogos: function () {
      var self = this;
      Promise.all([
        db.categorias.toArray(),
        db.platillos.toArray()
      ]).then(function (results) {
        self.categorias = results[0];
        self.platillos = results[1];
        if (typeof Alpine !== 'undefined') {
          var el = document.querySelector('[x-data="comandasData()"]');
          if (el && el.__x) {
            var data = el.__x.getData();
            if (data) {
              data.categorias = self.categorias;
              data.platillos = self.platillos;
            }
          }
        }
      }).catch(function (err) {
        console.error('[comandas] Error cargando catÃ¡logos:', err);
      });
    },

    cargarMesas: function () {
      return db.mesas.toArray();
    },

    cargarHistorial: function (fecha) {
      var self = this;
      return db.comandas.where('estado').equals('cerrada').toArray().then(function (comandas) {
        var fechaStr = fecha || new Date().toISOString().slice(0, 10);
        var filtradas = [];
        for (var i = 0; i < comandas.length; i++) {
          var c = comandas[i];
          var cFecha = c.createdAt ? c.createdAt.slice(0, 10) : '';
          if (cFecha === fechaStr) {
            filtradas.push(c);
          }
        }
        return filtradas;
      });
    },

    guardarComanda: function (cerrar, mesaId, items, numComensales, notas) {
      var self = this;
      return db.mesas.get(mesaId).then(function (mesa) {
        if (!mesa) { UI.toast('Mesa no encontrada', 'error'); return; }

        var total = 0;
        for (var i = 0; i < items.length; i++) {
          total += items[i].subtotal || 0;
        }

        var comanda = {
          id: uuid(),
          mesaId: mesaId,
          estado: cerrar ? 'cerrada' : 'abierta',
          items: JSON.stringify(items),
          total: total,
          numComensales: numComensales || 1,
          notas: notas || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        return db.comandas.put(comanda).then(function () {
          var nuevoEstado = cerrar ? 'cuenta' : 'ocupada';
          mesa.estado = nuevoEstado;
          mesa.updatedAt = new Date().toISOString();
          return db.mesas.put(mesa);
        }).then(function () {
          if (cerrar) {
            UI.toast('Comanda cerrada. Pasa a Cuentas para cobrar.', 'success');
          } else {
            UI.toast('Comanda guardada', 'success');
          }
          self.cargarCatalogos();
          return comanda;
        });
      });
    },

    colorEstado: function (estado) {
      if (estado === 'disponible') return '#22c55e';
      if (estado === 'ocupada') return '#ef4444';
      if (estado === 'cuenta') return '#f59e0b';
      return '#78716c';
    }
  };

  window.MODULES = window.MODULES || {};
  window.MODULES['comandas'] = Comandas;

  document.addEventListener('alpine:init', function () {
    Alpine.data('comandasData', function () {
      return {
        mesaSeleccionada: null,
        mesasDisponibles: [],
        categorias: [],
        platillos: [],
        itemsComanda: [],
        categoriaSel: null,
        busquedaPlatillo: '',
        numComensales: 1,
        notasComanda: '',
        historial: [],
        filtroFecha: new Date().toISOString().slice(0, 10),
        cargandoHistorial: true,

        get platillosFiltrados() {
          var q = this.busquedaPlatillo.toLowerCase().trim();
          var result = this.platillos;
          if (this.categoriaSel) {
            result = result.filter(function (p) { return p.categoriaId === this.categoriaSel; }.bind(this));
          }
          if (q) {
            result = result.filter(function (p) { return p.nombre.toLowerCase().indexOf(q) !== -1; });
          }
          return result;
        },

        get totalComanda() {
          var t = 0;
          for (var i = 0; i < this.itemsComanda.length; i++) {
            t += this.itemsComanda[i].subtotal || 0;
          }
          return t;
        },

        init: function (mesaId, comandaId) {
          var self = this;
          var mod = window.MODULES && window.MODULES['comandas'];

          this.categorias = mod ? mod.categorias : [];
          this.platillos = mod ? mod.platillos : [];

          // Cargar mesas disponibles
          db.mesas.where('estado').anyOf('disponible', 'ocupada').toArray().then(function (mesas) {
            self.mesasDisponibles = mesas;
          });

          // Cargar historial del dÃ­a
          this.cargarHistorial();

          // Si viene mesaId seleccionada
          if (mesaId && mesaId !== 'null') {
            db.mesas.get(mesaId).then(function (mesa) {
              if (mesa) {
                self.mesaSeleccionada = mesa;
                // Cargar comanda activa si existe
                if (comandaId && comandaId !== 'null') {
                  db.comandas.get(comandaId).then(function (com) {
                    if (com) {
                      self.itemsComanda = typeof com.items === 'string' ? JSON.parse(com.items) : (com.items || []);
                      self.numComensales = com.numComensales || 1;
                      self.notasComanda = com.notas || '';
                    }
                  });
                }
              }
            });
          }
        },

        seleccionarMesa: function (mesa) {
          this.mesaSeleccionada = mesa;
          this.itemsComanda = [];
          this.numComensales = 1;
          this.notasComanda = '';

          var self = this;
          db.comandas.where({ mesaId: mesa.id, estado: 'abierta' }).first().then(function (com) {
            if (com) {
              self.itemsComanda = typeof com.items === 'string' ? JSON.parse(com.items) : (com.items || []);
              self.numComensales = com.numComensales || 1;
              self.notasComanda = com.notas || '';
              UI.toast('Comanda existente cargada', 'info');
            }
          });
        },

        agregarItem: function (platillo) {
          if (!this.mesaSeleccionada) {
            UI.toast('Selecciona una mesa primero', 'warning');
            return;
          }

          // Buscar si ya existe el item
          var existente = null;
          for (var i = 0; i < this.itemsComanda.length; i++) {
            if (this.itemsComanda[i].platilloId === platillo.id) {
              existente = this.itemsComanda[i];
              break;
            }
          }

          if (existente) {
            existente.cantidad = (existente.cantidad || 1) + 1;
            existente.subtotal = existente.cantidad * existente.precioUnitario;
          } else {
            this.itemsComanda.push({
              platilloId: platillo.id,
              nombre: platillo.nombre,
              cantidad: 1,
              precioUnitario: platillo.precio,
              subtotal: platillo.precio,
              notas: ''
            });
          }
        },

        quitarItem: function (idx) {
          this.itemsComanda.splice(idx, 1);
        },

        guardarComanda: function (cerrar) {
          var self = this;
          if (!this.mesaSeleccionada) {
            UI.toast('Selecciona una mesa', 'warning');
            return;
          }
          if (this.itemsComanda.length === 0) {
            UI.toast('Agrega al menos un platillo', 'warning');
            return;
          }

          var mod = window.MODULES && window.MODULES['comandas'];
          if (mod) {
            mod.guardarComanda(cerrar, this.mesaSeleccionada.id, this.itemsComanda, this.numComensales, this.notasComanda).then(function () {
              if (cerrar) {
                self.itemsComanda = [];
                self.mesaSeleccionada = null;
              }
              self.cargarHistorial();
              // Recargar mesas
              db.mesas.where('estado').anyOf('disponible', 'ocupada').toArray().then(function (mesas) {
                self.mesasDisponibles = mesas;
              });
            });
          }
        },

        cargarHistorial: function () {
          var self = this;
          var mod = window.MODULES && window.MODULES['comandas'];
          if (mod) {
            mod.cargarHistorial(this.filtroFecha).then(function (comandas) {
              var promises = comandas.map(function (c) {
                return db.mesas.get(c.mesaId).then(function (mesa) {
                  c.mesaNombre = mesa ? mesa.nombre : c.mesaId;
                  c.numItems = c.items ? (typeof c.items === 'string' ? JSON.parse(c.items).length : c.items.length) : 0;
                  return c;
                });
              });
              return Promise.all(promises);
            }).then(function (result) {
              self.historial = result;
              self.cargandoHistorial = false;
            });
          }
        },

        colorEstado: function (estado) {
          return Comandas.colorEstado(estado);
        }
      };
    });
  });
})();
