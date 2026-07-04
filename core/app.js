// app.js — Router hash-based + carga de mÃ³dulos para AHA Comanda
// window.appRouter expuesto globalmente
// Dependencias: Alpine.js, window.MODULES

(function () {
  'use strict';

  if (typeof window.appRouter !== 'undefined') return;

  var currentModulo = null;
  var currentHash = '';
  var contentEl = null;
  var sidebarLinks = null;

  function init() {
    contentEl = document.getElementById('app-content');
    if (!contentEl) {
      console.warn('[app] #app-content no encontrado');
      return;
    }

    sidebarLinks = document.querySelectorAll('[data-module]');
    for (var i = 0; i < sidebarLinks.length; i++) {
      sidebarLinks[i].addEventListener('click', function (e) {
        var id = this.getAttribute('data-module');
        if (id) navigate(id);
      });
    }

    window.addEventListener('hashchange', onHashChange);
    onHashChange();

    // Service Worker registration
    if ('serviceWorker' in navigator) {
      var swVersion = window.DB_VERSION || 1;
      navigator.serviceWorker.register('./sw.js?v=' + swVersion)
        .then(function (reg) { console.log('[SW] Registrado:', reg.scope); })
        .catch(function (err) { console.warn('[SW] Error:', err); });
    }

    // Online/Offline listeners
    function updateOnlineStatus(online) {
      if (typeof Alpine !== 'undefined' && Alpine.store) {
        var current = Alpine.store('ui') || {};
        Alpine.store('ui', Object.assign({}, current, { online: online }));
      }
    }
    updateOnlineStatus(navigator.onLine);
    window.addEventListener('online', function () { updateOnlineStatus(true); });
    window.addEventListener('offline', function () { updateOnlineStatus(false); });
  }

  function navigate(moduloId, params) {
    params = params || {};
    var hash = '#/' + moduloId;
    if (Object.keys(params).length > 0) {
      var qs = '';
      var pKeys = Object.keys(params);
      for (var i = 0; i < pKeys.length; i++) {
        if (i > 0) qs += '&';
        qs += encodeURIComponent(pKeys[i]) + '=' + encodeURIComponent(params[pKeys[i]]);
      }
      hash += '?' + qs;
    }
    if (window.location.hash !== hash) {
      window.location.hash = hash;
    } else {
      loadModule(moduloId, params);
    }
  }

  function onHashChange() {
    var hash = window.location.hash || '#/';
    var match = hash.match(/^#\/([^?]+)(?:\?(.*))?/);
    var moduleId = match ? match[1] : null;
    var params = {};
    if (match && match[2]) {
      var pairs = match[2].split('&');
      for (var i = 0; i < pairs.length; i++) {
        var kv = pairs[i].split('=');
        if (kv.length === 2) {
          params[decodeURIComponent(kv[0])] = decodeURIComponent(kv[1]);
        }
      }
    }
    if (moduleId && moduleId !== currentHash) {
      currentHash = moduleId;
      loadModule(moduleId, params);
    }
  }

  function loadModule(moduloId, params) {
    params = params || {};
    if (currentModulo && currentModulo.destroy) {
      try { currentModulo.destroy(); } catch (e) { console.warn('[app] destroy error:', e); }
    }
    currentModulo = null;

    if (sidebarLinks) {
      for (var i = 0; i < sidebarLinks.length; i++) {
        sidebarLinks[i].classList.toggle('active', sidebarLinks[i].getAttribute('data-module') === moduloId);
      }
    }

    var mod = window.MODULES && window.MODULES[moduloId];
    if (!mod) {
      contentEl.innerHTML =
        '<div class="flex flex-col items-center justify-center py-20 text-base-content/50">' +
          '<i class="bi bi-box-seam text-6xl mb-4"></i>' +
          '<p class="text-lg">MÃ³dulo no encontrado</p>' +
          '<p class="text-sm mt-1">' + moduloId + '</p>' +
        '</div>';
      if (typeof Alpine !== 'undefined' && Alpine.store) {
        Alpine.store('app', { moduloActual: null });
      }
      return;
    }

    if (typeof Alpine !== 'undefined' && Alpine.store) {
      Alpine.store('app', { moduloActual: moduloId, loading: true });
    }

    try {
      if (mod.render) {
        contentEl.innerHTML = '<div class="animate__animated animate__fadeIn">' + mod.render(params) + '</div>';
      } else {
        contentEl.innerHTML = '<p class="text-base-content/50">MÃ³dulo sin vista</p>';
      }
      if (mod.init) mod.init();
      currentModulo = mod;
    } catch (e) {
      contentEl.innerHTML =
        '<div class="alert alert-error shadow-lg mt-4">' +
          '<i class="bi bi-exclamation-triangle"></i>' +
          '<span>Error al cargar: ' + e.message + '</span>' +
        '</div>';
      console.error('[app] Error loading ' + moduloId + ':', e);
    }

    if (typeof Alpine !== 'undefined' && Alpine.store) {
      Alpine.store('app', { moduloActual: moduloId, loading: false });
    }
  }

  window.appRouter = {
    init: init,
    navigate: navigate,
    getCurrent: function () { return currentHash; },
    getModulo: function () { return currentModulo; },
    isOnline: function () { return navigator.onLine; }
  };

  document.addEventListener('DOMContentLoaded', function () {
    setTimeout(init, 100);
  });

  console.log('[app] Router listo');
})();
