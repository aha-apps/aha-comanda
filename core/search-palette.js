// search-palette.js — Command Palette (Cmd+K) para AHA Comanda
// Dependencias: app.js (appRouter), Alpine.js

(function () {
  'use strict';

  if (typeof window.searchPaletteLoaded !== 'undefined') return;
  window.searchPaletteLoaded = true;

  document.addEventListener('alpine:init', function () {
    Alpine.data('searchPalette', function () {
      return {
        open: false,
        query: '',
        selectedIdx: 0,
        keyboardNav: false,

        get modulos() {
          var configModulos = window.APP_CONFIG && window.APP_CONFIG.modulos;
          if (!configModulos) return [];
          var result = [];
          var keys = Object.keys(configModulos);
          for (var i = 0; i < keys.length; i++) {
            var id = keys[i];
            var m = configModulos[id];
            if (m.activo === false) continue;
            result.push({
              id: id,
              title: m.titulo || id.charAt(0).toUpperCase() + id.slice(1),
              icon: m.icono || 'bi-box',
              type: 'module'
            });
          }
          return result;
        },

        get filtered() {
          var q = this.query.toLowerCase().trim();
          var modules = [];
          var records = [];

          if (!q) {
            modules = this.modulos.slice(0, 8);
          } else {
            modules = [];
            var allMods = this.modulos;
            for (var i = 0; i < allMods.length; i++) {
              var m = allMods[i];
              if (m.title.toLowerCase().indexOf(q) !== -1 || m.id.toLowerCase().indexOf(q) !== -1) {
                modules.push(m);
              }
            }
          }

          if (q.length >= 2 && window.ia && window.ia.search) {
            try {
              var results = window.ia.search(q, { limit: 3 });
              if (results && results.length) {
                for (var j = 0; j < Math.min(results.length, 3); j++) {
                  var r = results[j];
                  records.push({
                    id: r.id,
                    title: r.nombre || r.titulo || r.id,
                    subtitle: r.tipo || r.descripcion || '',
                    icon: 'bi-search',
                    type: 'record'
                  });
                }
              }
            } catch (e) {}
          }

          var selIdx = 0;
          var all = [];
          for (var k = 0; k < modules.length; k++) {
            modules[k]._kIdx = selIdx++;
            all.push(modules[k]);
          }
          if (modules.length && records.length) all.push({ type: 'separator' });
          for (var l = 0; l < records.length; l++) {
            records[l]._kIdx = selIdx++;
            all.push(records[l]);
          }
          return all;
        },

        get hasResults() {
          var items = this.filtered;
          for (var i = 0; i < items.length; i++) {
            if (items[i].type !== 'separator') return true;
          }
          return false;
        },

        openPalette: function () {
          this.open = true;
          this.query = '';
          this.selectedIdx = 0;
          this.keyboardNav = false;
          var self = this;
          this.$nextTick(function () {
            var input = document.querySelector('.sp-search-input');
            if (input) input.focus();
          });
        },

        closePalette: function () {
          this.open = false;
          this.query = '';
          this.selectedIdx = 0;
        },

        selectItem: function (item) {
          if (!item || item.type === 'separator') return;
          this.closePalette();
          if (item.type === 'module' && window.appRouter && window.appRouter.navigate) {
            window.appRouter.navigate(item.id);
          } else if (item.type === 'record' && window.appRouter && window.appRouter.navigate && item.id) {
            window.appRouter.navigate(item.id);
          }
        },

        onKeydown: function (e) {
          if (!this.open) return;
          this.keyboardNav = true;

          var items = [];
          var allItems = this.filtered;
          for (var i = 0; i < allItems.length; i++) {
            if (allItems[i].type !== 'separator') items.push(allItems[i]);
          }
          if (!items.length) return;

          if (e.key === 'ArrowDown') {
            e.preventDefault();
            this.selectedIdx = Math.min(this.selectedIdx + 1, items.length - 1);
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            this.selectedIdx = Math.max(this.selectedIdx - 1, 0);
          } else if (e.key === 'Enter') {
            e.preventDefault();
            this.selectItem(items[this.selectedIdx]);
          } else if (e.key === 'Escape') {
            this.closePalette();
          }
        }
      };
    });
  });
})();
