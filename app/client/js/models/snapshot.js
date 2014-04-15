App.module('Model.Snapshot', function (exports) {

  exports = Collectionize('Snapshot');

  exports.loadHourly = function () {
    App.Utils.storage('dateRange', 'loadHourly');
    App.Ajax.get({
      url: '/daily',
      success: loadData
    });
  };

  exports.loadDaily = function () {
    App.Utils.storage('dateRange', 'loadDaily');
    App.Ajax.get({
      url: '/daily',
      success: loadData
    });
  };

  exports.loadWeekly = function () {
    App.Utils.storage('dateRange', 'loadWeekly');
    App.Ajax.get({
      url: '/weekly',
      success: loadData
    });
  };

  exports.loadMonthly = function () {
    App.Utils.storage('dateRange', 'loadMonthly');
    App.Ajax.get({
      url: '/monthly',
      success: loadData
    });
  };

  function loadData(instances) {
    instances.sort(function (a, b) {
      return a.timestamp - b.timestamp;
    });

    App.Model.Chart.flush();
    App.Model.Instance.flush();
    exports.flush();
    _.each(instances, function (instance) {
      var processes = [];
      try {
        processes = JSON.parse(instance.processes);
      } catch (e) {
      }
      App.Model.Instance.add({
        name: instance.name,
        processes: processes
      });
      _.each(instance.data, function (snapshot) {
        try {
          snapshot = JSON.parse(snapshot);
        } catch (e) {
          snapshot = {};
        }
        snapshot.name = instance.name;
        exports.add(snapshot);
      });
    });
    App.Controller.Chart.render();
  }

  return exports;

});
