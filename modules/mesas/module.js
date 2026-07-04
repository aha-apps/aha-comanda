// mesas/module.js — GestiÃ³n de mesas con mapa visual
(function () {
  'use strict';

  var Mesas = {
    id: 'mesas',
    titulo: 'Mesas',
    icono: 'bi bi-grid-3x3-gap',

    items: [],
    busqueda: '',

    init: function () {
      console.log('[mesas] Inicializado');
      this.cargarLista();
    },

    render: function () {
      var self = this;
      return '<div x-data="mesasData()" x-init="init()">' +
        '<h2 class="text-2xl font-bold mb-4 flex items-center gap-2">' +
          '<i class="bi bi-grid-3x3-gap"></i> Mesas</h2>' +

        '<div class="flex flex-wrap gap-2 mb-4">' +
          '<button class="btn btn-primary" @click="abrirForm()">' +
            '<i class="bi bi-plus-lg"></i> Agregar mesa' +
          '</button>' +
          '<input type="search" x-model="busqueda" placeholder="Buscar mesa..." ' +
                 'class="input input-bordered flex-1 min-w-[200px]" />' +
        '</div>' +

        '<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 mb-6 mesa-grid">' +
          '<template x-for="mesa in itemsFiltrados" :key="mesa.id">' +
            '<div @click="accionMesa(mesa)" class="mesa-grid-item bg-base-100 rounded-box shadow-sm p-3 text-center border-2" ' +
                 ':style="\'border-color: \' + colorEstado(mesa.estado)">' +
              '<div class="text-2xl font-bold" :style="\'color: \' + colorEstado(mesa.estado)" x-text="mesa.nombre"></div>' +
              '<div class="text-xs text-base-content/50 mt-1">Cap. ' +
                '<span x-text="mesa.capacidad"></span></div>' +
              '<div class="text-xs text-base-content/50" x-show="mesa.ubicacion" x-text="mesa.ubicacion"></div>' +
              '<div class="mt-2">' +
                '<span class="badge badge-sm badge-estado" ' +
                      ':class="mesa.estado === \'disponible\' ? \'badge-success\' : mesa.estado === \'ocupada\' ? \'badge-error\' : \'badge-warning\'" ' +
                      'x-text="mesa.estado"></span>' +
              '</div>' +
            '</div>' +
          '</template>' +
        '</div>' +

        '<template x-if="itemsFiltrados.length === 0 && !cargando">' +
          '<div class="flex flex-col items-center justify-center py-16 text-base-content/50">' +
            '<i class="bi bi-grid-3x3-gap text-6xl mb-4"></i>' +
            '<p class="text-lg mb-4">No hay mesas aÃºn</p>' +
            '<button class="btn btn-primary" @click="abrirForm()">' +
              '<i class="bi bi-plus-lg"></i> Crear primera mesa' +
            '</button>' +
          '</div>' +
        '</template>' +

        '<template x-if="cargando">' +
          '<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">' +
            '<div class="skeleton h-32 w-full"></div>' +
            '<div class="skeleton h-32 w-full"></div>' +
            '<div class="skeleton h-32 w-full"></div>' +
            '<div class="skeleton h-32 w-full"></div>' +
          '</div>' +
        '</template>' +
      '</div>';
    },

    destroy: function () {},

    cargarLista: function () {
      var self = this;
      db.mesas.toArray().then(function (items) {
        self.items = items;
        if (typeof Alpine !== 'undefined') {
          var el = document.querySelector('[x-data="mesasData()"]');
          if (el && el.__x) {
            el.__x.getData().items = items;
          }
        }
      }).catch(function (err) {
        console.error('[mesas] Error cargando:', err);
      });
    },

    abrirForm: function (item) {
      var editando = !!item;
      var formData = item ? {
        nombre: item.nombre,
        capacidad: item.capacidad,
        ubicacion: item.ubicacion || '',
        estado: item.estado || 'disponible'
      } : { nombre: '', capacidad: 2, ubicacion: '', estado: 'disponible' };

      window._modalFormData = formData;

      var html = '<div class="space-y-4">' +
        '<label class="form-control w-full">' +
          '<span class="label-text">Nombre / NÃºmero de mesa</span>' +
          '<input type="text" x-model="form.nombre" class="input input-bordered" required />' +
        '</label>' +
        '<label class="form-control w-full">' +
          '<span class="label-text">Capacidad (personas)</span>' +
          '<input type="number" x-model="form.capacidad" class="input input-bordered" min="1" max="20" />' +
        '</label>' +
        '<label class="form-control w-full">' +
          '<span class="label-text">UbicaciÃ³n</span>' +
          '<input type="text" x-model="form.ubicacion" class="input input-bordered" placeholder="Terraza, Interior, Barra..." />' +
        '</label>' +
        '<label class="form-control w-full">' +
          '<span class="label-text">Estado</span>' +
          '<select x-model="form.estado" class="select select-bordered">' +
            '<option value="disponible">Disponible</option>' +
            '<option value="ocupada">Ocupada</option>' +
            '<option value="cuenta">Cuenta</option>' +
          '</select>' +
        '</label>' +
      '</div>';

      UI.modalForm(
        editando ? 'Editar mesa' : 'Nueva mesa',
        html,
        function (data) {
          if (editando) return Mesas.actualizar(item.id, data);
          else return Mesas.guardar(data);
        }
      );
    },

    guardar: function (datos) {
      var registro = {
        id: uuid(),
        nombre: datos.nombre,
        capacidad: parseInt(datos.capacidad) || 2,
        ubicacion: datos.ubicacion || '',
        estado: datos.estado || 'disponible',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      return db.mesas.put(registro).then(function () {
        UI.toast('Mesa creada', 'success');
        Mesas.cargarLista();
      });
    },

    actualizar: function (id, datos) {
      return db.mesas.get(id).then(function (existente) {
        if (!existente) { UI.toast('Mesa no encontrada', 'error'); return; }
        existente.nombre = datos.nombre;
        existente.capacidad = parseInt(datos.capacidad) || existente.capacidad;
        existente.ubicacion = datos.ubicacion || '';
        existente.estado = datos.estado || 'disponible';
        existente.updatedAt = new Date().toISOString();
        return db.mesas.put(existente).then(function () {
          UI.toast('Mesa actualizada', 'success');
          Mesas.cargarLista();
        });
      });
    },

    eliminar: function (item) {
      UI.confirm('Eliminar la mesa ' + item.nombre + '?').then(function (ok) {
        if (!ok) return;
        db.mesas.delete(item.id).then(function () {
          UI.toast('Mesa eliminada', 'success');
          Mesas.cargarLista();
        }).catch(function (e) {
          UI.toast(e.message, 'error');
        });
      });
    },

    accionMesa: function (mesa) {
      if (mesa.estado === 'disponible') {
        // Ocupar mesa: navegar a comandas con mesa seleccionada
        if (window.appRouter) {
          window.appRouter.navigate('comandas', { mesaId: mesa.id });
        }
      } else if (mesa.estado === 'ocupada') {
        // Ver comanda activa de esta mesa
        db.comandas.where({ mesaId: mesa.id, estado: 'abierta' }).first().then(function (comanda) {
          if (comanda) {
            if (window.appRouter) {
              window.appRouter.navigate('comandas', { mesaId: mesa.id, comandaId: comanda.id });
            }
          } else {
            UI.toast('No hay comanda activa para esta mesa', 'info');
          }
        });
      } else if (mesa.estado === 'cuenta') {
        // Ir a cuentas con esta mesa
        if (window.appRouter) {
          window.appRouter.navigate('cuentas', { mesaId: mesa.id });
        }
      }
    },

    colorEstado: function (estado) {
      if (estado === 'disponible') return '#22c55e';
      if (estado === 'ocupada') return '#ef4444';
      if (estado === 'cuenta') return '#f59e0b';
      return '#78716c';
    }
  };

  window.MODULES = window.MODULES || {};
  window.MODULES['mesas'] = Mesas;

  document.addEventListener('alpine:init', function () {
    Alpine.data('mesasData', function () {
      return {
        items: [],
        busqueda: '',
        cargando: true,

        get itemsFiltrados() {
          var q = this.busqueda.toLowerCase().trim();
          if (!q) return this.items;
          return this.items.filter(function (m) {
            return m.nombre.toLowerCase().indexOf(q) !== -1 ||
                   (m.ubicacion && m.ubicacion.toLowerCase().indexOf(q) !== -1);
          });
        },

        init: function () {
          var self = this;
          var mod = window.MODULES && window.MODULES['mesas'];
          if (mod) {
            this.items = mod.items;
            this.cargando = false;
          }
        },

        abrirForm: function (item) {
          Mesas.abrirForm(item);
        },

        eliminar: function (item) {
          Mesas.eliminar(item);
        },

        accionMesa: function (mesa) {
          Mesas.accionMesa(mesa);
        },

        colorEstado: function (estado) {
          return Mesas.colorEstado(estado);
        }
      };
    });
  });
})();
