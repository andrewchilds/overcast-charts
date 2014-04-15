App.module('Controller.Chart', function (exports) {

  exports.charts = {};

  exports.render = function () {
    var html = Caveman.render('gridLayout', {
      instances: App.Model.Instance.db,
      activeDateRange: App.Utils.storage('dateRange')
    });
    document.getElementById('content').innerHTML = html;

    renderCharts();
  };

  function renderCharts() {
    App.Model.Instance.each(function (instance) {
      var snapshots = App.Model.Snapshot.filter({ name: instance.name });

      if (App.Utils.storage('dateRange') === 'loadHourly') {
        snapshots = _.first(snapshots, 36);
      }

      snapshots.sort(function (a, b) {
        return a.timestamp - b.timestamp;
      });

      var lastSnapshot = _.last(snapshots);

      generateProcessList(instance);

      generateChart({
        data: [
          getDataForKey(snapshots, {
            label: '1min',
            key: 'cpu_1min',
            area: true,
            color: 'rgba(0, 140, 220, 0.2)'
          }),
          getDataForKey(snapshots, {
            label: '5min',
            key: 'cpu_5min',
            area: true,
            color: 'rgba(0, 140, 220, 0.5)'
          }),
          getDataForKey(snapshots, {
            label: '15min',
            key: 'cpu_15min',
            area: true,
            color: 'rgba(0, 140, 220, 1)'
          })
        ],
        element: '[data-name="' + instance.name + '"] svg.cpu',
        modifyFn: function (chart) {
          chart.forceY([0, 1]);
        },
        name: instance.name,
        snapshots: snapshots,
        formatFn: function (d) {
          return d3.format(',.2f')(d);
        }
      });

      generateChart({
        type: 'stackedAreaChart',
        data: [
          getDataForKey(snapshots, {
            label: 'Swap',
            key: 'swap_used',
            color: '#c00'
          }),
          getDataForKey(snapshots, {
            label: 'Used',
            color: 'rgba(240, 150, 0, 0.8)',
            key: 'cache_used'
          }),
          getDataForKey(snapshots, {
            label: 'Cached',
            color: 'rgba(240, 200, 50, 0.4)',
            fn: function (snapshot) {
              return snapshot.data.mem_used - snapshot.data.cache_used;
            }
          })
        ],
        element: '[data-name="' + instance.name + '"] svg.ram',
        modifyFn: function (chart) {
          chart.showControls(false);
          chart.yDomain([0, (lastSnapshot.data.mem_total + lastSnapshot.data.swap_used) || 1024]);
        },
        name: instance.name,
        snapshots: snapshots,
        formatFn: formatFilesize
      });

      generateChart({
        data: [
          getDataForKey(snapshots, {
            label: 'Disk used',
            key: 'disk_used',
            area: true,
            color: 'rgba(80, 150, 0, 0.9)'
          })
        ],
        element: '[data-name="' + instance.name + '"] svg.disk',
        modifyFn: function (chart) {
          chart.forceY([0, lastSnapshot.data.disk_total || 1024 * 20]);
        },
        name: instance.name,
        snapshots: snapshots,
        formatFn: formatFilesize
      });

      generateChart({
        data: [
          getDataForKey(snapshots, {
            label: 'Disk reads, KB/s',
            fn: function (snapshot, last) {
              return convertToKBPS(snapshot, last, 'io_reads');
            },
            color: 'rgba(80, 150, 0, 0.9)'
          }),
          getDataForKey(snapshots, {
            label: 'Disk writes, KB/s',
            fn: function (snapshot, last) {
              return convertToKBPS(snapshot, last, 'io_writes');
            },
            color: 'rgba(80, 150, 0, 0.4)'
          })
        ],
        element: '[data-name="' + instance.name + '"] svg.io',
        name: instance.name,
        snapshots: snapshots,
        formatFn: formatKBPS
      });

      generateChart({
        data: [
          getDataForKey(snapshots, {
            label: 'TCP connections',
            key: 'tcp',
            area: true,
            color: 'rgba(60, 20, 150, 0.6)'
          })
        ],
        element: '[data-name="' + instance.name + '"] svg.connections',
        name: instance.name,
        snapshots: snapshots,
        modifyFn: function (chart) {
          chart.forceY([0, 100]);
        }
      });

      generateChart({
        data: [
          getDataForKey(snapshots, {
            label: 'Transmitted, KB/s',
            fn: function (snapshot, last) {
              return convertToKBPS(snapshot, last, 'tx_bytes');
            },
            color: 'rgba(0, 50, 200, 0.9)'
          }),
          getDataForKey(snapshots, {
            label: 'Received, KB/s',
            fn: function (snapshot, last) {
              return convertToKBPS(snapshot, last, 'rx_bytes');
            },
            color: 'rgba(0, 50, 200, 0.4)'
          })
        ],
        element: '[data-name="' + instance.name + '"] svg.network',
        name: instance.name,
        snapshots: snapshots,
        formatFn: formatKBPS
      });

      var lastTab = App.Utils.storage('tab-' + instance.name);
      if (lastTab) {
        $('[data-name="' + instance.name + '"] .tabs a[data-tab="' + lastTab + '"]').click();
      }
    });
  }

  function convertToKBPS(snapshot, last, key) {
    if (last) {
      var kb = (snapshot.data[key] - last.data[key]) / 1024;
      var seconds = (snapshot.timestamp - last.timestamp) / 1000;
      return Math.max(0, kb / seconds);
    }
    return 0;
  }

  function formatKBPS(d) {
    if (d > 999) {
      return d3.format(',.0f')(d / 1024) + 'MB/s';
    } else if (d > 99) {
      return d3.format(',.1f')(d / 1024) + 'MB/s';
    } else if (d > 9) {
      return d3.format(',.0f')(d) + 'KB/s';
    }
    return d3.format(',.1f')(d) + 'KB/s';
  }

  function formatFilesize(d) {
    if (d > 9999) {
      return d3.format(',.1f')(d / 1024) + 'GB';
    } else if (d > 999) {
      return d3.format(',.2f')(d / 1024) + 'GB';
    }
    return d3.format(',')(d) + 'MB';
  }

  function getDataForKey(snapshots, options) {
    var data = {
      area: !!options.area,
      key: options.label,
      values: []
    };
    if (options.color) {
      data.color = options.color;
    }

    _.each(snapshots, function (snapshot, i) {
      var x = snapshot.timestamp;
      var y = (options.fn ? options.fn(snapshot, snapshots[i - 1]) : snapshot.data[options.key]) || 0;
      data.values.push([ x, y ]);
    });

    return data;
  }

  function generateProcessList(instance, sortBy) {
    instance.processes = instance.processes || [];
    sortBy = sortBy || 'mem%';
    instance.processes.sort(function (a, b) {
      if (sortBy === 'time') {
        return b[sortBy].replace(':', '1') - a[sortBy].replace(':', '1');
      }
      if (_.isNumber(a[sortBy])) {
        return b[sortBy] - a[sortBy];
      }
      return a[sortBy] > b[sortBy] ? 1 : -1;
    });
    var html = Caveman.render('processTable', {
      processes: instance.processes
    });

    var parent = $('[data-name="' + instance.name + '"] .process-tab');
    parent.html(html);

    var activeHeaders = {
      'cpu%': 'th.cpu-column',
      'mem%': 'th.ram-column',
      'time': 'th.time-column',
      'name': 'th.name-column'
    };
    parent.find(activeHeaders[sortBy]).addClass('active');
  }

  function generateChart(options) {
    nv.addGraph(function() {
      var chart = nv.models[options.type || 'lineChart']()
        .margin({ bottom: 12, left: 12, right: 50, top: 28 })
        .x(function (d) { return d[0]; })
        .y(function (d) { return d[1]; })
        .useInteractiveGuideline(true)
        .rightAlignYAxis(true)
        .transitionDuration(150)
        .showLegend(false)
        .showXAxis(false)
        .forceY([0, 1])
        .clipEdge(false);

      //Format x-axis labels with custom function.
      chart.xAxis.tickFormat(function (d) {
        return d3.time.format('%b %e, %I:%M %p')(new Date(d));
      });

      chart.yAxis.tickFormat(function (d) {
        return options.formatFn ? options.formatFn(d) : d3.format(',f')(d);
      });

      if (options.modifyFn) {
        options.modifyFn(chart);
      }

      d3.select(options.element).datum(options.data).call(chart);

      // nv.utils.windowResize(chart.update);

      App.Model.Chart.add({
        chart: chart,
        snapshots: options.snapshots,
        element: options.element,
        name: options.name
      });

      return chart;
    });
  }

  exports.viewTab = function () {
    var selector = App.Utils.data(this, 'tab');
    var parent = $(this).closest('.instance');

    parent.find('.tabs a.active').each(function () {
      var selector = App.Utils.data(this, 'tab');
      parent.find(selector).addClass('hidden');
      $(this).removeClass('active');
    });

    $(this).addClass('active');
    parent.find(selector).removeClass('hidden');

    App.Utils.storage('tab-' + parent.data('name'), selector);

    if (selector === '.charts-tab') {
      var charts = App.Model.Chart.filter({ name: parent.data('name') });
      _.each(charts, function (chart) {
        chart.chart.update();
      });
    }

    return false;
  };

  exports.orderByName = function () {
    return orderProcessList(this, 'name');
  };

  exports.orderByCPU = function () {
    return orderProcessList(this, 'cpu%');
  };

  exports.orderByRAM = function () {
    return orderProcessList(this, 'mem%');
  };

  exports.orderByTime = function () {
    return orderProcessList(this, 'time');
  };

  function orderProcessList(context, sortBy) {
    var parent = $(context).closest('.instance');
    var instance = App.Model.Instance.find({ name: parent.data('name') });
    var chart = App.Model.Chart.find({ name: parent.data('name') });

    generateProcessList(instance, sortBy);

    return false;
  }

  exports.updateDateSelector = function () {
    (App.Model.Snapshot[$(this).val()] || _.noop)();

    return false;
  };

});
