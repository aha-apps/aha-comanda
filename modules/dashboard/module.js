// dashboard/module.js — Panel resumen para AHA Comanda
(function () {
  'use strict';

  var Dashboard = {
    id: 'dashboard',
    titulo: 'Dashboard',
    icono: 'bi bi-speedometer2',

    datos: {
      mesasTotal: 0,
      comandasActivas: 0,
      totalVentasDia: 0,
      platilloMasVendido: '',
      horaPico: '',
      topPlatillos: [],
      actividadReciente: []
    },

    chartInstance: null,

    init: function () {
      console.log('[dashboard] Inicializado');
      this.cargarDatos();
    },

    render: function () {
      var self = this;
      return '<div x-data="dashboardData()" x-init="init()">' +
        '<h2 class="text-2xl font-bold mb-6 flex items-center gap-2">' +
          '<i class="bi bi-speedometer2"></i> Dashboard</h2>' +
        '<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">' +
          '<div class="stat bg-base-100 rounded-box shadow-sm stat-card">' +
            '<div class="stat-figure text-primary"><i class="bi bi-grid-3x3-gap text-3xl"></i></div>' +
            '<div class="stat-title">Mesas</div>' +
            '<div class="stat-value text-primary" x-text="datos.mesasTotal">0</div>' +
            '<div class="stat-desc">Total en el salÃ³n</div>' +
          '</div>' +
          '<div class="stat bg-base-100 rounded-box shadow-sm stat-card">' +
            '<div class="stat-figure text-accent"><i class="bi bi-receipt text-3xl"></i></div>' +
            '<div class="stat-title">Comandas activas</div>' +
            '<div class="stat-value text-accent" x-text="datos.comandasActivas">0</div>' +
            '<div class="stat-desc">En curso</div>' +
          '</div>' +
          '<div class="stat bg-base-100 rounded-box shadow-sm stat-card">' +
            '<div class="stat-figure text-success"><i class="bi bi-cash-stack text-3xl"></i></div>' +
            '<div class="stat-title">Ventas hoy</div>' +
            '<div class="stat-value text-success" x-text="UI.formatCurrency(datos.totalVentasDia)">$0</div>' +
            '<div class="stat-desc">Total del dÃ­a</div>' +
          '</div>' +
          '<div class="stat bg-base-100 rounded-box shadow-sm stat-card">' +
            '<div class="stat-figure text-secondary"><i class="bi bi-trophy text-3xl"></i></div>' +
            '<div class="stat-title">MÃ¡s vendido</div>' +
            '<div class="stat-value text-secondary text-xl truncate" x-text="datos.platilloMasVendido || \'—\'">—</div>' +
            '<div class="stat-desc">Platillo estrella</div>' +
          '</div>' +
        '</div>' +
        '<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">' +
          '<div class="bg-base-100 rounded-box shadow-sm p-4">' +
            '<h3 class="font-semibold mb-4 flex items-center gap-2"><i class="bi bi-bar-chart"></i> Platillos mÃ¡s vendidos</h3>' +
            '<canvas id="topPlatillosChart" class="w-full h-48"></canvas>' +
          '</div>' +
          '<div class="bg-base-100 rounded-box shadow-sm p-4">' +
            '<h3 class="font-semibold mb-4 flex items-center gap-2"><i class="bi bi-clock-history"></i> Actividad reciente</h3>' +
            '<div class="space-y-3">' +
              '<template x-if="datos.actividadReciente.length === 0">' +
                '<p class="text-sm text-base-content/50 text-center py-8">Sin actividad reciente</p>' +
              '</template>' +
              '<template x-for="act in datos.actividadReciente" :key="act.id">' +
                '<div class="flex items-center gap-3 text-sm">' +
                  '<div class="w-2 h-2 rounded-full" :class="act.tipo === \'comanda\' ? \'bg-primary\' : \'bg-success\'"></div>' +
                  '<span class="flex-1" x-text="act.texto"></span>' +
                  '<span class="text-xs text-base-content/40" x-text="UI.formatRelative(act.fecha)"></span>' +
                '</div>' +
              '</template>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>';
    },

    destroy: function () {
      if (this.chartInstance) {
        this.chartInstance.destroy();
        this.chartInstance = null;
      }
    },

    cargarDatos: function () {
      var self = this;
      var hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      var hoyStr = hoy.toISOString();

      Promise.all([
        db.mesas.count(),
        db.comandas.where('estado').equals('abierta').count(),
        db.cuentas.toArray(),
        db.comandas.where('estado').equals('cerrada').toArray(),
        db.comandas.orderBy('createdAt').reverse().limit(10).toArray()
      ]).then(function (results) {
        var mesasCount = results[0];
        var activasCount = results[1];
        var cuentas = results[2];
        var comandasCerradas = results[3];
        var recientes = results[4];

        // Calcular ventas del dÃ­a
        var totalDia = 0;
        for (var i = 0; i < cuentas.length; i++) {
          var c = cuentas[i];
          var cDate = new Date(c.createdAt);
          if (cDate >= hoy) {
            totalDia += c.total || 0;
          }
        }

        // Calcular platillo mÃ¡s vendido
        var platilloCount = {};
        for (var j = 0; j < comandasCerradas.length; j++) {
          var com = comandasCerradas[j];
          if (com.items) {
            var items = typeof com.items === 'string' ? JSON.parse(com.items) : com.items;
            for (var k = 0; k < items.length; k++) {
              var item = items[k];
              var nombre = item.nombre || item.platillo || 'Desconocido';
              platilloCount[nombre] = (platilloCount[nombre] || 0) + (item.cantidad || 1);
            }
          }
        }

        var topPlatillos = [];
        var platilloKeys = Object.keys(platilloCount);
        platilloKeys.sort(function (a, b) { return platilloCount[b] - platilloCount[a]; });
        for (var p = 0; p < Math.min(platilloKeys.length, 5); p++) {
          topPlatillos.push({ nombre: platilloKeys[p], cantidad: platilloCount[platilloKeys[p]] });
        }

        var platilloMasVendido = topPlatillos.length > 0 ? topPlatillos[0].nombre : '';

        // Actividad reciente
        var actividad = [];
        for (var r = 0; r < recientes.length; r++) {
          var rec = recientes[r];
          var mesaNombre = '';
          db.mesas.get(rec.mesaId).then(function (mesa) {
            // AsÃ­ncrono, pero lo manejamos con el texto base
          });
          actividad.push({
            id: rec.id,
            texto: 'Comanda en mesa ' + (rec.mesaId ? rec.mesaId.slice(0, 8) : '?'),
            fecha: rec.createdAt,
            tipo: rec.estado === 'abierta' ? 'comanda' : 'cerrada'
          });
        }

        self.datos.mesasTotal = mesasCount;
        self.datos.comandasActivas = activasCount;
        self.datos.totalVentasDia = totalDia;
        self.datos.platilloMasVendido = platilloMasVendido;
        self.datos.topPlatillos = topPlatillos;
        self.datos.actividadReciente = actividad;

        // Actualizar Alpine store y chart
        if (typeof Alpine !== 'undefined') {
          var el = document.querySelector('[x-data="dashboardData()"]');
          if (el && el.__x) {
            var data = el.__x.getData();
            if (data) data.datos = self.datos;
          }
        }

        self.renderChart(topPlatillos);
      }).catch(function (err) {
        console.error('[dashboard] Error cargando datos:', err);
      });
    },

    renderChart: function (topPlatillos) {
      var self = this;
      setTimeout(function () {
        var canvas = document.getElementById('topPlatillosChart');
        if (!canvas) return;

        if (self.chartInstance) {
          self.chartInstance.destroy();
        }

        if (typeof Chart === 'undefined') return;

        var labels = [];
        var data = [];
        var colors = ['#b91c1c', '#f59e0b', '#78716c', '#22c55e', '#3b82f6'];

        for (var i = 0; i < topPlatillos.length; i++) {
          labels.push(topPlatillos[i].nombre);
          data.push(topPlatillos[i].cantidad);
        }

        self.chartInstance = new Chart(canvas, {
          type: 'bar',
          data: {
            labels: labels,
            datasets: [{
              label: 'Veces vendido',
              data: data,
              backgroundColor: colors.slice(0, data.length),
              borderRadius: 6
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              y: { beginAtZero: true, ticks: { stepSize: 1 } }
            }
          }
        });
      }, 100);
    }
  };

  window.MODULES = window.MODULES || {};
  window.MODULES['dashboard'] = Dashboard;

  // Alpine data component
  document.addEventListener('alpine:init', function () {
    Alpine.data('dashboardData', function () {
      return {
        datos: {
          mesasTotal: 0,
          comandasActivas: 0,
          totalVentasDia: 0,
          platilloMasVendido: '',
          topPlatillos: [],
          actividadReciente: []
        },
        init: function () {
          var self = this;
          // Sincronizar con el mÃ³dulo
          var mod = window.MODULES && window.MODULES['dashboard'];
          if (mod) {
            this.datos = mod.datos;
          }
        }
      };
    });
  });
})();
