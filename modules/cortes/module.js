// cortes/module.js — Corte de caja del dÃ­a
(function () {
  'use strict';

  var Cortes = {
    id: 'cortes',
    titulo: 'Cortes',
    icono: 'bi bi-cash-stack',

    datos: {
      totalVentas: 0,
      numComandas: 0,
      ticketPromedio: 0,
      porFormaPago: { efectivo: 0, tarjeta: 0, transferencia: 0 },
      platillosVendidos: [],
      ultimasComandas: []
    },

    init: function () {
      console.log('[cortes] Inicializado');
      this.cargarDatos();
    },

    render: function () {
      return '<div x-data="cortesData()" x-init="init()">' +
        '<h2 class="text-2xl font-bold mb-4 flex items-center gap-2">' +
          '<i class="bi bi-cash-stack"></i> Corte de caja</h2>' +

        '<div class="flex flex-wrap gap-2 mb-4">' +
          '<input type="date" x-model="fecha" @change="cargarDatos()" class="input input-bordered" />' +
          '<button class="btn btn-primary" @click="exportPDF()">' +
            '<i class="bi bi-file-earmark-pdf"></i> Exportar PDF' +
          '</button>' +
          '<button class="btn btn-ghost" @click="exportCSV()">' +
            '<i class="bi bi-file-earmark-spreadsheet"></i> Exportar CSV' +
          '</button>' +
        '</div>' +

        '<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">' +
          '<div class="stat bg-base-100 rounded-box shadow-sm stat-card">' +
            '<div class="stat-figure text-primary"><i class="bi bi-cash-stack text-3xl"></i></div>' +
            '<div class="stat-title">Total ventas</div>' +
            '<div class="stat-value text-primary" x-text="UI.formatCurrency(datos.totalVentas)"></div>' +
            '<div class="stat-desc">Del dÃ­a</div>' +
          '</div>' +
          '<div class="stat bg-base-100 rounded-box shadow-sm stat-card">' +
            '<div class="stat-figure text-accent"><i class="bi bi-receipt text-3xl"></i></div>' +
            '<div class="stat-title">Comandas</div>' +
            '<div class="stat-value text-accent" x-text="datos.numComandas"></div>' +
            '<div class="stat-desc">Cerradas</div>' +
          '</div>' +
          '<div class="stat bg-base-100 rounded-box shadow-sm stat-card">' +
            '<div class="stat-figure text-secondary"><i class="bi bi-calculator text-3xl"></i></div>' +
            '<div class="stat-title">Ticket promedio</div>' +
            '<div class="stat-value text-secondary text-xl" x-text="UI.formatCurrency(datos.ticketPromedio)"></div>' +
            '<div class="stat-desc">Por comanda</div>' +
          '</div>' +
          '<div class="stat bg-base-100 rounded-box shadow-sm stat-card">' +
            '<div class="stat-figure text-success"><i class="bi bi-people text-3xl"></i></div>' +
            '<div class="stat-title">Formas de pago</div>' +
            '<div class="stat-value text-success text-lg" x-text="Object.keys(datos.porFormaPago).filter(function(k){return datos.porFormaPago[k]>0}).length + \'/3\'"></div>' +
            '<div class="stat-desc">Efectivo / Tarjeta / Transf.</div>' +
          '</div>' +
        '</div>' +

        '<div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">' +
          '<div class="bg-base-100 rounded-box shadow-sm p-4">' +
            '<h3 class="font-semibold mb-3 flex items-center gap-2">' +
              '<i class="bi bi-pie-chart"></i> Ventas por forma de pago</h3>' +
            '<div class="space-y-3">' +
              '<template x-for="(total, forma) in datos.porFormaPago" :key="forma">' +
                '<div x-show="total > 0">' +
                  '<div class="flex justify-between text-sm mb-1">' +
                    '<span class="capitalize" x-text="forma"></span>' +
                    '<span class="font-semibold" x-text="UI.formatCurrency(total)"></span>' +
                  '</div>' +
                  '<progress class="progress w-full" ' +
                            ':class="forma === \'efectivo\' ? \'progress-success\' : forma === \'tarjeta\' ? \'progress-info\' : \'progress-warning\'" ' +
                            ':value="total" :max="datos.totalVentas || 1"></progress>' +
                '</div>' +
              '</template>' +
              '<div x-show="Object.values(datos.porFormaPago).reduce(function(a,b){return a+b},0) === 0" class="text-sm text-base-content/50 text-center py-4">' +
                'Sin ventas en este dÃ­a</div>' +
            '</div>' +
          '</div>' +

          '<div class="bg-base-100 rounded-box shadow-sm p-4">' +
            '<h3 class="font-semibold mb-3 flex items-center gap-2">' +
              '<i class="bi bi-trophy"></i> Top 5 platillos</h3>' +
            '<div class="space-y-2">' +
              '<template x-for="(plat, i) in datos.platillosVendidos.slice(0, 5)" :key="i">' +
                '<div class="flex items-center gap-2">' +
                  '<span class="badge badge-primary badge-sm" x-text="i + 1"></span>' +
                  '<span class="flex-1 text-sm" x-text="plat.nombre"></span>' +
                  '<span class="text-sm font-semibold" x-text="\'x\' + plat.cantidad"></span>' +
                '</div>' +
              '</template>' +
              '<div x-show="datos.platillosVendidos.length === 0" class="text-sm text-base-content/50 text-center py-4">' +
                'Sin datos de platillos</div>' +
            '</div>' +
          '</div>' +
        '</div>' +

        '<div class="bg-base-100 rounded-box shadow-sm p-4">' +
          '<h3 class="font-semibold mb-3 flex items-center gap-2">' +
            '<i class="bi bi-table"></i> Resumen de comandas</h3>' +
          '<div class="overflow-x-auto">' +
            '<table class="table table-zebra table-sm">' +
              '<thead>' +
                '<tr><th>Mesa</th><th>Items</th><th>Total</th><th>Pago</th><th>Hora</th></tr>' +
              '</thead>' +
              '<tbody>' +
                '<template x-for="com in datos.ultimasComandas" :key="com.id">' +
                  '<tr>' +
                    '<td x-text="com.mesaNombre || com.mesaId"></td>' +
                    '<td x-text="com.numItems || 0"></td>' +
                    '<td x-text="UI.formatCurrency(com.total)"></td>' +
                    '<td>' +
                      '<span class="badge badge-sm capitalize" ' +
                            ':class="com.formaPago === \'efectivo\' ? \'badge-success\' : com.formaPago === \'tarjeta\' ? \'badge-info\' : \'badge-warning\'" ' +
                            'x-text="com.formaPago || \'—\'"></span>' +
                    '</td>' +
                    '<td x-text="UI.formatRelative(com.createdAt)"></td>' +
                  '</tr>' +
                '</template>' +
              '</tbody>' +
            '</table>' +
          '</div>' +
          '<div x-show="datos.ultimasComandas.length === 0" class="text-sm text-base-content/50 text-center py-4">' +
            'No hay comandas en esta fecha</div>' +
        '</div>' +
      '</div>';
    },

    destroy: function () {},

    cargarDatos: function (fecha) {
      var self = this;
      var f = fecha || new Date().toISOString().slice(0, 10);

      var hoyInicio = new Date(f + 'T00:00:00');
      var hoyFin = new Date(f + 'T23:59:59');

      Promise.all([
        db.cuentas.toArray(),
        db.comandas.where('estado').equals('pagada').toArray(),
        db.comandas.where('estado').equals('cerrada').toArray()
      ]).then(function (results) {
        var cuentas = results[0];
        var pagadas = results[1];
        var cerradas = results[2];

        var totalVentas = 0;
        var numComandas = 0;
        var porFormaPago = { efectivo: 0, tarjeta: 0, transferencia: 0 };
        var platillosCount = {};
        var comandasDelDia = [];
        var todasComandas = pagadas.concat(cerradas);

        for (var i = 0; i < cuentas.length; i++) {
          var cta = cuentas[i];
          var ctaDate = new Date(cta.createdAt);
          if (ctaDate >= hoyInicio && ctaDate <= hoyFin) {
            totalVentas += cta.total || 0;
            numComandas++;
            if (cta.formaPago && porFormaPago[cta.formaPago] !== undefined) {
              porFormaPago[cta.formaPago] += cta.total || 0;
            }
            comandasDelDia.push(cta);
          }
        }

        // Acumular platillos de las comandas del dÃ­a
        for (var j = 0; j < todasComandas.length; j++) {
          var com = todasComandas[j];
          var comDate = new Date(com.createdAt);
          if (comDate >= hoyInicio && comDate <= hoyFin && com.items) {
            var items = typeof com.items === 'string' ? JSON.parse(com.items) : com.items;
            for (var k = 0; k < items.length; k++) {
              var item = items[k];
              var nombre = item.nombre || 'Desconocido';
              platillosCount[nombre] = (platillosCount[nombre] || 0) + (item.cantidad || 1);
            }
          }
        }

        // Ordenar platillos
        var platillosArr = [];
        var pKeys = Object.keys(platillosCount);
        pKeys.sort(function (a, b) { return platillosCount[b] - platillosCount[a]; });
        for (var p = 0; p < pKeys.length; p++) {
          platillosArr.push({ nombre: pKeys[p], cantidad: platillosCount[pKeys[p]] });
        }

        var ticketPromedio = numComandas > 0 ? totalVentas / numComandas : 0;

        // Agregar nombres de mesa a comandas del dÃ­a
        var self2 = self;
        var mesaPromises = comandasDelDia.map(function (c) {
          return db.comandas.get(c.comandaId).then(function (com) {
            if (com) {
              c.mesaId = com.mesaId;
              c.numItems = com.items ? (typeof com.items === 'string' ? JSON.parse(com.items).length : com.items.length) : 0;
              return db.mesas.get(com.mesaId).then(function (mesa) {
                c.mesaNombre = mesa ? mesa.nombre : com.mesaId;
                return c;
              });
            }
            c.mesaNombre = '?';
            return c;
          });
        });

        return Promise.all(mesaPromises).then(function () {
          self2.datos = {
            totalVentas: totalVentas,
            numComandas: numComandas,
            ticketPromedio: ticketPromedio,
            porFormaPago: porFormaPago,
            platillosVendidos: platillosArr,
            ultimasComandas: comandasDelDia.slice(0, 20)
          };

          if (typeof Alpine !== 'undefined') {
            var el = document.querySelector('[x-data="cortesData()"]');
            if (el && el.__x) {
              el.__x.getData().datos = self2.datos;
            }
          }
        });
      }).catch(function (err) {
        console.error('[cortes] Error:', err);
      });
    },

    exportPDF: function () {
      var datos = this.datos;
      var fecha = new Date().toLocaleDateString('es-MX');
      var contenido = '<html><head><meta charset="UTF-8"><title>Corte de caja - AHA Comanda</title>' +
        '<style>' +
          'body { font-family: "Courier New", monospace; font-size: 12px; padding: 20px; }' +
          'h1 { text-align: center; font-size: 18px; margin-bottom: 5px; }' +
          'h2 { text-align: center; font-size: 14px; margin-bottom: 20px; color: #666; }' +
          '.total { font-size: 24px; text-align: center; margin: 20px 0; }' +
          'table { width: 100%; border-collapse: collapse; margin: 10px 0; }' +
          'th, td { padding: 6px 8px; text-align: left; border-bottom: 1px solid #ddd; }' +
          'th { background: #f5f5f5; }' +
          '.right { text-align: right; }' +
          '.section { margin: 20px 0; }' +
          '.section-title { font-weight: bold; font-size: 14px; margin-bottom: 10px; border-bottom: 2px solid #333; padding-bottom: 5px; }' +
          '@media print { .no-print { display: none; } }' +
        '</style></head><body>' +
        '<h1>AHA Comanda</h1>' +
        '<h2>Corte de caja - ' + fecha + '</h2>' +
        '<hr>' +
        '<div class="total">Total: $' + datos.totalVentas.toFixed(2) + '</div>' +
        '<p style="text-align:center">Comandas: ' + datos.numComandas + ' | Ticket promedio: $' + datos.ticketPromedio.toFixed(2) + '</p>' +
        '<hr>' +
        '<div class="section">' +
          '<div class="section-title">Ventas por forma de pago</div>' +
          '<table>' +
            '<tr><th>Forma</th><th class="right">Total</th></tr>';

      for (var forma in datos.porFormaPago) {
        if (datos.porFormaPago.hasOwnProperty(forma) && datos.porFormaPago[forma] > 0) {
          contenido += '<tr><td class="capitalize">' + forma + '</td><td class="right">$' + datos.porFormaPago[forma].toFixed(2) + '</td></tr>';
        }
      }

      contenido += '</table></div>' +
        '<div class="section">' +
          '<div class="section-title">Top platillos</div>' +
          '<table><tr><th>#</th><th>Platillo</th><th class="right">Cantidad</th></tr>';

      for (var p = 0; p < Math.min(datos.platillosVendidos.length, 5); p++) {
        contenido += '<tr><td>' + (p + 1) + '</td><td>' + datos.platillosVendidos[p].nombre + '</td><td class="right">' + datos.platillosVendidos[p].cantidad + '</td></tr>';
      }

      contenido += '</table></div>' +
        '<div class="section no-print" style="text-align:center;margin-top:30px">' +
          '<button onclick="window.print()" style="padding:10px 20px;font-size:14px;cursor:pointer">Imprimir</button>' +
        '</div>' +
        '</body></html>';

      var ventana = window.open('', '_blank');
      ventana.document.write(contenido);
      ventana.document.close();
    },

    exportCSV: function () {
      var datos = this.datos;
      var lineas = [];
      lineas.push('Corte de caja,AHA Comanda');
      lineas.push('Fecha,' + new Date().toLocaleDateString('es-MX'));
      lineas.push('');
      lineas.push('Mesa,Total,Forma Pago,Fecha');

      for (var i = 0; i < datos.ultimasComandas.length; i++) {
        var c = datos.ultimasComandas[i];
        var mesa = c.mesaNombre || c.mesaId || '';
        var total = (c.total || 0).toFixed(2);
        var pago = c.formaPago || '';
        var fecha = c.createdAt ? new Date(c.createdAt).toLocaleString('es-MX') : '';
        lineas.push(mesa + ',' + total + ',' + pago + ',' + fecha);
      }

      lineas.push('');
      lineas.push('Total ventas,' + datos.totalVentas.toFixed(2));
      lineas.push('Comandas,' + datos.numComandas);
      lineas.push('Ticket promedio,' + datos.ticketPromedio.toFixed(2));

      var csv = lineas.join('\r\n');
      var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'corte-' + new Date().toISOString().slice(0, 10) + '.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      UI.toast('CSV exportado', 'success');
    }
  };

  window.MODULES = window.MODULES || {};
  window.MODULES['cortes'] = Cortes;

  document.addEventListener('alpine:init', function () {
    Alpine.data('cortesData', function () {
      return {
        fecha: new Date().toISOString().slice(0, 10),
        datos: {
          totalVentas: 0,
          numComandas: 0,
          ticketPromedio: 0,
          porFormaPago: { efectivo: 0, tarjeta: 0, transferencia: 0 },
          platillosVendidos: [],
          ultimasComandas: []
        },

        init: function () {
          var mod = window.MODULES && window.MODULES['cortes'];
          if (mod) {
            this.datos = mod.datos;
          }
        },

        cargarDatos: function () {
          var mod = window.MODULES && window.MODULES['cortes'];
          if (mod) mod.cargarDatos(this.fecha);
        },

        exportPDF: function () {
          var mod = window.MODULES && window.MODULES['cortes'];
          if (mod) mod.exportPDF();
        },

        exportCSV: function () {
          var mod = window.MODULES && window.MODULES['cortes'];
          if (mod) mod.exportCSV();
        }
      };
    });
  });
})();
