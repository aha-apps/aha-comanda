// sw.js — Offline-first Service Worker para AHA Comanda
var CACHE_PREFIX = 'aha-comanda-v1';
var DB_VERSION = new URL(self.location.href).searchParams.get('v') || 1;
var CACHE = CACHE_PREFIX + '-' + DB_VERSION;

var PRECACHE_URLS = [
  './',
  'index.html',
  'core/env.js',
  'core/db.js',
  'core/crypto.js',
  'core/ui.js',
  'core/theme.js',
  'core/app.js',
  'core/search-palette.js',
  'core/file-store.js',
  'core/sync.js',
  'core/license.js',
  'core/network.js',
  'core/brand-loader.js',
  'core/feature-flags.js',
  'main.js'
];

// AÃ±adir mÃ³dulos al precache
var MODULE_DIRS = [
  'modules/dashboard/module.js', 'modules/dashboard/module.html',
  'modules/mesas/module.js', 'modules/mesas/module.html',
  'modules/comandas/module.js', 'modules/comandas/module.html',
  'modules/platillos/module.js', 'modules/platillos/module.html',
  'modules/cuentas/module.js', 'modules/cuentas/module.html',
  'modules/cortes/module.js', 'modules/cortes/module.html'
];

for (var i = 0; i < MODULE_DIRS.length; i++) {
  PRECACHE_URLS.push(MODULE_DIRS[i]);
}

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (cache) {
      return cache.addAll(PRECACHE_URLS);
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (k) {
          return k.startsWith(CACHE_PREFIX + '-') && k !== CACHE;
        }).map(function (k) {
          return caches.delete(k);
        })
      );
    }).then(function () {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  e.respondWith(
    caches.match(req).then(function (cached) {
      if (cached) return cached;
      return fetch(req).then(function (response) {
        if (response && response.ok && req.method === 'GET') {
          var clone = response.clone();
          caches.open(CACHE).then(function (cache) {
            cache.put(req, clone);
          });
        }
        return response;
      });
    })
  );
});
