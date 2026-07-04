// brand-loader.js — White-label system (Business tier)
(function () {
  'use strict';

  if (typeof window.brandLoader !== 'undefined') return;

  var DEFAULTS = {
    client: '',
    appName: 'AHA Comanda',
    appId: 'aha-comanda',
    colors: {
      primary: '#b91c1c',
      secondary: '#78716c',
      accent: '#f59e0b',
      neutral: '#292524',
      'base-100': '#ffffff',
      'base-200': '#fef2f2',
      'base-300': '#fecaca',
      info: '#3b82f6',
      success: '#22c55e',
      warning: '#f59e0b',
      error: '#ef4444'
    },
    fonts: {
      heading: 'Inter, system-ui, sans-serif',
      body: 'Inter, system-ui, sans-serif',
      mono: 'JetBrains Mono, monospace'
    },
    logo: { light: '', dark: '', favicon: '', splash: '' },
    features: {},
    support: { email: '', docsUrl: '', phone: '' },
    customCss: '',
    version: '1.0.0'
  };

  var DAISYUI_MAP = {
    primary: '--p', secondary: '--s', accent: '--a', neutral: '--n',
    'base-100': '--b1', 'base-200': '--b2', 'base-300': '--b3',
    info: '--in', success: '--su', warning: '--wa', error: '--er'
  };

  var CONFIG_PATH = './brand.config.json';
  var STORAGE_KEY = 'ateje_brand_preview';
  var currentConfig = null;
  var listeners = [];
  var isNeutralino = typeof window.NL_OS !== 'undefined' && window.NL_OS;

  function deepMerge(base, override) {
    var result = JSON.parse(JSON.stringify(base));
    if (!override) return result;
    var keys = Object.keys(override);
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      if (override[key] && typeof override[key] === 'object' && !Array.isArray(override[key])) {
        result[key] = deepMerge(result[key] || {}, override[key]);
      } else if (override[key] !== undefined && override[key] !== '') {
        result[key] = override[key];
      }
    }
    return result;
  }

  function parseColor(hex) {
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    var r = parseInt(hex.substring(0, 2), 16);
    var g = parseInt(hex.substring(2, 4), 16);
    var b = parseInt(hex.substring(4, 6), 16);
    if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
    return { r: r, g: g, b: b };
  }

  function hexToOklch(hex) {
    var c = parseColor(hex);
    if (!c) return null;
    var r = c.r / 255, g = c.g / 255, b = c.b / 255;
    r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
    g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
    b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;
    var l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
    var m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
    var s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;
    l = Math.cbrt(l); m = Math.cbrt(m); s = Math.cbrt(s);
    var L = 0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s;
    var a = 1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s;
    var bChroma = 0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s;
    var C = Math.sqrt(a * a + bChroma * bChroma);
    var H = Math.atan2(bChroma, a) * (180 / Math.PI);
    if (H < 0) H += 360;
    L = Math.round(L * 100) / 100;
    C = Math.round(C * 100) / 100;
    H = Math.round(H * 100) / 100;
    if (isNaN(H)) H = 0;
    return L + ' ' + C + ' ' + H;
  }

  function applyTheme(config) {
    var root = document.documentElement;
    var colors = config.colors || {};
    var colorKeys = Object.keys(colors);
    for (var i = 0; i < colorKeys.length; i++) {
      var key = colorKeys[i];
      var hex = colors[key];
      if (hex && DAISYUI_MAP[key]) {
        var oklch = hexToOklch(hex);
        if (oklch) root.style.setProperty(DAISYUI_MAP[key], oklch);
      }
    }
    root.style.setProperty('--font-heading', config.fonts.heading);
    root.style.setProperty('--font-body', config.fonts.body);
    root.style.setProperty('--font-mono', config.fonts.mono);

    if (config.customCss) {
      var styleEl = document.getElementById('brand-custom-css');
      if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = 'brand-custom-css';
        document.head.appendChild(styleEl);
      }
      styleEl.textContent = config.customCss;
    }

    if (config.logo.favicon) {
      var link = document.querySelector('link[rel="icon"]');
      if (link) link.href = config.logo.favicon;
    }
    document.title = config.appName || document.title;
  }

  function loadFromFetch() {
    return fetch(CONFIG_PATH)
      .then(function (res) {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .catch(function () { return null; });
  }

  function loadConfig() {
    return new Promise(function (resolve) {
      if (currentConfig) { resolve(currentConfig); return; }

      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        try {
          var preview = JSON.parse(raw);
          currentConfig = deepMerge(DEFAULTS, preview);
          applyTheme(currentConfig);
          resolve(currentConfig);
          return;
        } catch (e) {
          localStorage.removeItem(STORAGE_KEY);
        }
      }

      var loadPromise = isNeutralino ? Promise.resolve(null) : loadFromFetch();

      loadPromise.then(function (json) {
        if (json) {
          currentConfig = deepMerge(DEFAULTS, json);
          applyTheme(currentConfig);
          resolve(currentConfig);
        } else {
          currentConfig = JSON.parse(JSON.stringify(DEFAULTS));
          resolve(currentConfig);
        }
      });
    });
  }

  window.brandLoader = {
    DEFAULTS: DEFAULTS,
    load: loadConfig,
    get: function () { return currentConfig || DEFAULTS; },
    set: function (partial) {
      currentConfig = deepMerge(currentConfig || DEFAULTS, partial);
      applyTheme(currentConfig);
    },
    reset: function () {
      currentConfig = JSON.parse(JSON.stringify(DEFAULTS));
      applyTheme(currentConfig);
    }
  };

  console.log('[brand-loader] Inicializado');
})();
