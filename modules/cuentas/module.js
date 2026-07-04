// cuentas/module.js — Cierre de cuentas, split y formas de pago
(function () {
  'use strict';

  var Cuentas = {
    id: 'cuentas',
    titulo: 'Cuentas',
    icono: 'bi bi-credit-card-2-back',

    comandasPendientes: [],

    init: function () {
      console.log('[cuentas] Inicializado');
      this.cargarPendientes();
    },

    render: function () {
      return '<div x-data="cuentasData()" x-init="init()">' +
        '<h2 class="text-2xl font-bold mb-4 flex items-center gap-2">' +
          '<i class="bi bi-credit-card-2-back"></i> Cuentas</h2>' +

        '<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">' +

          // Comandas pendientes de cobro
          '<div>' +
            '<div class="bg-base-100 rounded-box shadow-sm p-4">' +
              '<h3 class="font-semibold mb-3 flex items-center gap-2">' +
                '<i class="bi bi-clock"></i> Comandas por cobrar</h3>' +
              '<template x-if="pendientes.length > 0">' +
                '<div class="space-y-2">' +
                  '<template x-for="com in pendientes" :key="com.id">' +
                    '<div @click="seleccionarComanda(com)" ' +
                         'class="flex items-center justify-between p-3 rounded-lg cursor-pointer border" ' +
                         ':class="comandaSel && comandaSel.id === com.id ? \'border-primary bg-primary/5\' : \'border-base-300 hover:bg-base-200\'">' +
                      '<div>' +
                        '<div class="font-medium" x-text="\'Mesa \' + (com.mesaNombre || com.mesaId)"></div>' +
                        '<div class="text-xs text-base-content/50" x-text="UI.formatRelative(com.createdAt)"></div>' +
                      '</div>' +
                      '<div class="text-right">' +
                        '<div class="font-bold text-primary" x-text="UI.formatCurrency(com.total)"></div>' +
                        '<div class="text-xs text-base-content/50" x-text="\'Items: \' + com.numItems"></div>' +
                      '</div>' +
                    '</div>' +
                  '</template>' +
                '</div>' +
              '</template>' +
              '<template x-if="pendientes.length === 0">' +
                '<div class="text-center py-8 text-base-content/50">' +
                  '<i class="bi bi-check-circle text-4xl mb-2 block text-success"></i>' +
                  '<p class="text-sm">No hay cuentas pendientes</p>' +
                '</div>' +
              '</template>' +
            '</div>' +
          '</div>' +

          // Detalle de cuenta y cierre
          '<div>' +
            '<template x-if="comandaSel">' +
              '<div class="bg-base-100 rounded-box shadow-sm p-4">' +
                '<h3 class="font-semibold mb-3 flex items-center gap-2">' +
                  '<i class="bi bi-receipt"></i> Cuenta: Mesa <span x-text="comandaSel.mesaNombre || comandaSel.mesaId"></span></h3>' +

                '<div class="divide-y divide-base-200 mb-4">' +
                  '<template x-for="(item, i) in itemsDetalle" :key="i">' +
                    '<div class="flex items-center justify-between py-2">' +
                      '<div>' +
                        '<div class="text-sm" x-text="item.nombre"></div>' +
                        '<div class="text-xs text-base-content/50">x <span x-text="item.cantidad"></span></div>' +
                      '</div>' +
                      '<div class="text-sm font-medium" x-text="UI.formatCurrency(item.subtotal)"></div>' +
                    '</div>' +
                  '</template>' +
                '</div>' +

                '<div class="border-t border-base-300 pt-3 mb-4">' +
                  '<div class="flex justify-between text-lg font-bold">' +
                    '<span>Total</span>' +
                    '<span class="text-primary" x-text="UI.formatCurrency(comandaSel.total)"></span>' +
                  '</div>' +
                '</div>' +

                '<div class="space-y-3">' +
                  '<label class="form-control w-full">' +
                    '<span class="label-text">Split (N personas)</span>' +
                    '<div class="flex items-center gap-2">' +
                      '<button @click="split = Math.max(1, split - 1)" class="btn btn-outline btn-sm">' +
                        '<i class="bi bi-dash"></i></button>' +
                      '<span class="badge badge-lg badge-primary" x-text="split"></span>' +
                      '<button @click="split = Math.min(20, split + 1)" class="btn btn-outline btn-sm">' +
                        '<i class="bi bi-plus"></i></button>' +
                      '<span class="text-sm text-base-content/50 ml-2">' +
                        'c/u: <span class="font-semibold" x-text="UI.formatCurrency(comandaSel.total / split)"></span></span>' +
                    '</div>' +
                  '</label>' +

                  '<label class="form-control w-full">' +
                    '<span class="label-text">Forma de pago</span>' +
                    '<select x-model="formaPago" class="select select-bordered">' +
                      '<option value="efectivo">Efectivo</option>' +
                      '<option value="tarjeta">Tarjeta</option>' +
                      '<option value="transferencia">Transferencia</option>' +
                    '</select>' +
                  '</label>' +

                  '<button @click="cerrarCuenta()" class="btn btn-primary w-full">' +
                    '<i class="bi bi-check-lg"></i> Cerrar cuenta' +
                  '</button>' +
                '</div>' +
              '</div>' +
            '</template>' +

            '<template x-if="!comandaSel">' +
              '<div class="bg-base-100 rounded-box shadow-sm p-4">' +
                '<div class="text-center py-8 text-base-content/40">' +
                  '<i class="bi bi-hand-index text-4xl mb-2 block"></i>' +
                  '<p class="text-sm">Selecciona una comanda para cobrar</p>' +
                '</div>' +
              '</div>' +
            '</template>' +
          '</div>' +
        '</div>' +

        // Cuentas cerradas hoy
        '<div class="mt-8 bg-base-100 rounded-box shadow-sm p-4">' +
          '<h3 class="font-semibold mb-3 flex items-center gap-2">' +
            '<i class="bi bi-check-circle"></i> Cuentas cerradas hoy</h3>' +
          '<div class="overflow-x-auto">' +
            '<table class="table table-zebra table-sm">' +
              '<thead>' +
                '<tr><th>Mesa</th><th>Total</th><th>Split</th><th>Pago</th><th>Hora</th></tr>' +
              '</thead>' +
              '<tbody>' +
                '<template x-for="c in cuentasHoy" :key="c.id">' +
                  '<tr>' +
                    '<td x-text="c.mesaNombre || c.comandaId"></td>' +
                    '<td x-text="UI.formatCurrency(c.total)"></td>' +
                    '<td x-text="c.split ? c.split + \' pers.\' : \'—\'"></td>' +
                    '<td>' +
                      '<span class="badge badge-sm" ' +
                            ':class="c.formaPago === \'efectivo\' ? \'badge-success\' : c.formaPago === \'tarjeta\' ? \'badge-info\' : \'badge-warning\'" ' +
                            'x-text="c.formaPago || \'—\'"></span>' +
                    '</td>' +
                    '<td x-text="UI.formatRelative(c.createdAt)"></td>' +
                  '</tr>' +
                '</template>' +
              '</tbody>' +
            '</table>' +
          '</div>' +
          '<div x-show="cuentasHoy.length === 0" class="text-sm text-base-content/50 text-center py-4">' +
            'No hay cuentas cerradas hoy</div>' +
        '</div>' +
      '</div>';
    },

    destroy: function () {},

    cargarPendientes: function () {
      var self = this;
      db.comandas.where('estado').equals('cuenta').toArray().then(function (comandas) {
        var promises = comandas.map(function (c) {
          return db.mesas.get(c.mesaId).then(function (mesa) {
            c.mesaNombre = mesa ? mesa.nombre : c.mesaId;
            c.numItems = c.items ? (typeof c.items === 'string' ? JSON.parse(c.items).length : c.items.length) : 0;
            return c;
          });
        });
        return Promise.all(promises);
      }).then(function (comandas) {
        self.comandasPendientes = comandas;
        if (typeof Alpine !== 'undefined') {
          var el = document.querySelector('[x-data="cuentasData()"]');
          if (el && el.__x) {
            el.__x.getData().pendientes = comandas;
          }
        }
      });
    },

    cerrarCuenta: function (comandaId, split, formaPago) {
      var self = this;
      return db.comandas.get(comandaId).then(function (comanda) {
        if (!comanda) { UI.toast('Comanda no encontrada', 'error'); return; }

        var total = comanda.total || 0;
        var cuenta = {
          id: uuid(),
          comandaId: comandaId,
          total: total,
          split: split || 1,
          formaPago: formaPago || 'efectivo',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        return db.cuentas.put(cuenta).then(function () {
          // Marcar mesa como disponible
          return db.mesas.get(comanda.mesaId).then(function (mesa) {
            if (mesa) {
              mesa.estado = 'disponible';
              mesa.updatedAt = new Date().toISOString();
              return db.mesas.put(mesa);
            }
          });
        }).then(function () {
          // Actualizar comanda
          comanda.estado = 'pagada';
          comanda.updatedAt = new Date().toISOString();
          return db.comandas.put(comanda);
        }).then(function () {
          UI.toast('Cuenta cerrada correctamente', 'success');
          self.cargarPendientes();
          return cuenta;
        });
      });
    },

    cargarCuentasHoy: function () {
      var hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      return db.cuentas.toArray().then(function (cuentas) {
        var filtradas = [];
        for (var i = 0; i < cuentas.length; i++) {
          var c = cuentas[i];
          var cDate = new Date(c.createdAt);
          if (cDate >= hoy) {
            filtradas.push(c);
          }
        }
        // Agregar nombre de mesa
        var promises = filtradas.map(function (c) {
          return db.comandas.get(c.comandaId).then(function (com) {
            if (com) {
              return db.mesas.get(com.mesaId).then(function (mesa) {
                c.mesaNombre = mesa ? mesa.nombre : com.mesaId;
                return c;
              });
            }
            c.mesaNombre = c.comandaId;
            return c;
          });
        });
        return Promise.all(promises);
      });
    }
  };

  window.MODULES = window.MODULES || {};
  window.MODULES['cuentas'] = Cuentas;

  document.addEventListener('alpine:init', function () {
    Alpine.data('cuentasData', function () {
      return {
        pendientes: [],
        comandaSel: null,
        itemsDetalle: [],
        split: 1,
        formaPago: 'efectivo',
        cuentasHoy: [],

        init: function () {
          var self = this;
          var mod = window.MODULES && window.MODULES['cuentas'];
          if (mod) {
            this.pendientes = mod.comandasPendientes;
          }

          mod.cargarCuentasHoy().then(function (cuentas) {
            self.cuentasHoy = cuentas;
          });
        },

        seleccionarComanda: function (com) {
          this.comandaSel = com;
          this.split = 1;
          this.formaPago = 'efectivo';
          this.itemsDetalle = com.items ? (typeof com.items === 'string' ? JSON.parse(com.items) : com.items) : [];
        },

        cerrarCuenta: function () {
          var self = this;
          if (!this.comandaSel) return;
          var mod = window.MODULES && window.MODULES['cuentas'];
          if (mod) {
            mod.cerrarCuenta(this.comandaSel.id, this.split, this.formaPago).then(function () {
              self.comandaSel = null;
              self.itemsDetalle = [];
              self.split = 1;
              // Recargar cuentas hoy
              mod.cargarCuentasHoy().then(function (cuentas) {
                self.cuentasHoy = cuentas;
              });
            });
          }
        }
      };
    });
  });
})();
