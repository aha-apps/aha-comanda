// platillos/module.js — CRUD de platillos del menÃº
(function () {
  'use strict';

  var Platillos = {
    id: 'platillos',
    titulo: 'Platillos',
    icono: 'bi bi-cup-straw',

    items: [],
    categorias: [],

    init: function () {
      console.log('[platillos] Inicializado');
      this.cargarDatos();
    },

    render: function () {
      return '<div x-data="platillosData()" x-init="init()">' +
        '<h2 class="text-2xl font-bold mb-4 flex items-center gap-2">' +
          '<i class="bi bi-cup-straw"></i> Platillos</h2>' +

        '<div class="flex flex-wrap gap-2 mb-4">' +
          '<button class="btn btn-primary" @click="abrirForm()">' +
            '<i class="bi bi-plus-lg"></i> Agregar platillo' +
          '</button>' +
          '<input type="search" x-model="busqueda" placeholder="Buscar platillo..." ' +
                 'class="input input-bordered flex-1 min-w-[200px]" />' +
          '<select x-model="filtroCategoria" class="select select-bordered">' +
            '<option value="">Todas las categorÃ­as</option>' +
            '<template x-for="cat in categorias" :key="cat.id">' +
              '<option :value="cat.id" x-text="cat.nombre"></option>' +
            '</template>' +
          '</select>' +
        '</div>' +

        '<template x-if="itemsFiltrados.length > 0">' +
          '<div class="overflow-x-auto">' +
            '<table class="table table-zebra">' +
              '<thead>' +
                '<tr><th>Platillo</th><th>CategorÃ­a</th><th>Precio</th><th>Disponible</th><th>Acciones</th></tr>' +
              '</thead>' +
              '<tbody>' +
                '<template x-for="item in itemsFiltrados" :key="item.id">' +
                  '<tr>' +
                    '<td>' +
                      '<div class="flex items-center gap-2">' +
                        '<div x-show="item.imagen" class="avatar">' +
                          '<div class="w-8 rounded">' +
                            '<img :src="item.imagen" @error="$el.style.display=\'none\'" />' +
                          '</div>' +
                        '</div>' +
                        '<span class="font-medium" x-text="item.nombre"></span>' +
                      '</div>' +
                    '</td>' +
                    '<td><span class="text-sm" x-text="nombreCategoria(item.categoriaId)"></span></td>' +
                    '<td class="font-semibold" x-text="UI.formatCurrency(item.precio)"></td>' +
                    '<td>' +
                      '<input type="checkbox" class="toggle toggle-sm" ' +
                             ':class="item.disponible !== false ? \'toggle-success\' : \'toggle-error\'" ' +
                             ':checked="item.disponible !== false" ' +
                             '@change="toggleDisponible(item)" />' +
                    '</td>' +
                    '<td>' +
                      '<button class="btn btn-sm btn-ghost" @click="abrirForm(item)">' +
                        '<i class="bi bi-pencil"></i>' +
                      '</button>' +
                      '<button class="btn btn-sm btn-ghost text-error" @click="eliminar(item)">' +
                        '<i class="bi bi-trash"></i>' +
                      '</button>' +
                    '</td>' +
                  '</tr>' +
                '</template>' +
              '</tbody>' +
            '</table>' +
          '</div>' +
        '</template>' +

        '<template x-if="itemsFiltrados.length === 0 && !cargando">' +
          '<div class="flex flex-col items-center justify-center py-16 text-base-content/50">' +
            '<i class="bi bi-cup-straw text-6xl mb-4"></i>' +
            '<p class="text-lg mb-4">No hay platillos aÃºn</p>' +
            '<button class="btn btn-primary" @click="abrirForm()">' +
              '<i class="bi bi-plus-lg"></i> Agregar primer platillo' +
            '</button>' +
          '</div>' +
        '</template>' +

        '<template x-if="cargando">' +
          '<div class="space-y-3">' +
            '<div class="skeleton h-12 w-full"></div>' +
            '<div class="skeleton h-12 w-full"></div>' +
            '<div class="skeleton h-12 w-full"></div>' +
          '</div>' +
        '</template>' +
      '</div>';
    },

    destroy: function () {},

    cargarDatos: function () {
      var self = this;
      Promise.all([
        db.platillos.toArray(),
        db.categorias.toArray()
      ]).then(function (results) {
        self.items = results[0];
        self.categorias = results[1];
        if (typeof Alpine !== 'undefined') {
          var el = document.querySelector('[x-data="platillosData()"]');
          if (el && el.__x) {
            var data = el.__x.getData();
            if (data) {
              data.items = self.items;
              data.categorias = self.categorias;
            }
          }
        }
      }).catch(function (err) {
        console.error('[platillos] Error:', err);
      });
    },

    abrirForm: function (item) {
      var editando = !!item;
      var formData = item ? {
        nombre: item.nombre,
        categoriaId: item.categoriaId || '',
        precio: item.precio,
        disponible: item.disponible !== false,
        imagen: item.imagen || ''
      } : { nombre: '', categoriaId: '', precio: 0, disponible: true, imagen: '' };

      window._modalFormData = formData;

      var html = '<div class="space-y-4">' +
        '<label class="form-control w-full">' +
          '<span class="label-text">Nombre del platillo</span>' +
          '<input type="text" x-model="form.nombre" class="input input-bordered" required />' +
        '</label>' +
        '<label class="form-control w-full">' +
          '<span class="label-text">CategorÃ­a</span>' +
          '<select x-model="form.categoriaId" class="select select-bordered">' +
            '<option value="">Seleccionar categorÃ­a</option>' +
            '<template x-for="cat in $store.categoriasList" :key="cat.id">' +
              '<option :value="cat.id" x-text="cat.nombre"></option>' +
            '</template>' +
          '</select>' +
        '</label>' +
        '<label class="form-control w-full">' +
          '<span class="label-text">Precio ($)</span>' +
          '<input type="number" x-model="form.precio" class="input input-bordered" min="0" step="0.01" />' +
        '</label>' +
        '<label class="form-control w-full">' +
          '<span class="label-text">URL de imagen (opcional)</span>' +
          '<input type="url" x-model="form.imagen" class="input input-bordered" placeholder="https://..." />' +
        '</label>' +
        '<label class="form-control w-full">' +
          '<span class="label-text">Disponible</span>' +
          '<select x-model="form.disponible" class="select select-bordered">' +
            '<option :value="true">Disponible</option>' +
            '<option :value="false">No disponible</option>' +
          '</select>' +
        '</label>' +
      '</div>';

      UI.modalForm(
        editando ? 'Editar platillo' : 'Nuevo platillo',
        html,
        function (data) {
          if (editando) return Platillos.actualizar(item.id, data);
          else return Platillos.guardar(data);
        }
      );
    },

    guardar: function (datos) {
      var registro = {
        id: uuid(),
        nombre: datos.nombre,
        categoriaId: datos.categoriaId || '',
        precio: parseFloat(datos.precio) || 0,
        disponible: datos.disponible !== false,
        imagen: datos.imagen || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      return db.platillos.put(registro).then(function () {
        UI.toast('Platillo creado', 'success');
        Platillos.cargarDatos();
      });
    },

    actualizar: function (id, datos) {
      return db.platillos.get(id).then(function (existente) {
        if (!existente) { UI.toast('Platillo no encontrado', 'error'); return; }
        existente.nombre = datos.nombre;
        existente.categoriaId = datos.categoriaId || '';
        existente.precio = parseFloat(datos.precio) || 0;
        existente.disponible = datos.disponible !== false;
        existente.imagen = datos.imagen || '';
        existente.updatedAt = new Date().toISOString();
        return db.platillos.put(existente).then(function () {
          UI.toast('Platillo actualizado', 'success');
          Platillos.cargarDatos();
        });
      });
    },

    toggleDisponible: function (item) {
      var nuevo = item.disponible !== false ? false : true;
      return db.platillos.get(item.id).then(function (existente) {
        if (!existente) return;
        existente.disponible = nuevo;
        existente.updatedAt = new Date().toISOString();
        return db.platillos.put(existente).then(function () {
          item.disponible = nuevo;
          UI.toast(item.nombre + ' ' + (nuevo ? 'disponible' : 'no disponible'), 'info');
        });
      });
    },

    eliminar: function (item) {
      UI.confirm('Eliminar ' + item.nombre + '?').then(function (ok) {
        if (!ok) return;
        db.platillos.delete(item.id).then(function () {
          UI.toast('Platillo eliminado', 'success');
          Platillos.cargarDatos();
        }).catch(function (e) {
          UI.toast(e.message, 'error');
        });
      });
    },

    nombreCategoria: function (categoriaId) {
      for (var i = 0; i < this.categorias.length; i++) {
        if (this.categorias[i].id === categoriaId) return this.categorias[i].nombre;
      }
      return 'Sin categorÃ­a';
    }
  };

  window.MODULES = window.MODULES || {};
  window.MODULES['platillos'] = Platillos;

  document.addEventListener('alpine:init', function () {
    Alpine.data('platillosData', function () {
      return {
        items: [],
        categorias: [],
        busqueda: '',
        filtroCategoria: '',
        cargando: true,

        get itemsFiltrados() {
          var q = this.busqueda.toLowerCase().trim();
          var result = this.items;
          if (this.filtroCategoria) {
            result = result.filter(function (p) { return p.categoriaId === this.filtroCategoria; }.bind(this));
          }
          if (q) {
            result = result.filter(function (p) { return p.nombre.toLowerCase().indexOf(q) !== -1; });
          }
          return result;
        },

        init: function () {
          var mod = window.MODULES && window.MODULES['platillos'];
          if (mod) {
            this.items = mod.items;
            this.categorias = mod.categorias;
            this.cargando = false;
          }
          // Store para categorÃ­as en forms
          if (typeof Alpine !== 'undefined' && Alpine.store) {
            Alpine.store('categoriasList', this.categorias);
          }
        },

        abrirForm: function (item) { Platillos.abrirForm(item); },
        eliminar: function (item) { Platillos.eliminar(item); },
        toggleDisponible: function (item) { Platillos.toggleDisponible(item); },

        nombreCategoria: function (id) {
          return Platillos.nombreCategoria(id);
        }
      };
    });
  });
})();
