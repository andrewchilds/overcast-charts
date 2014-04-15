App.module('Init', function (exports) {

  exports.firstRun = true;

  exports.init = function () {
    if (exports.firstRun) {
      $.fastbinder();
    }

    if (!App.Utils.storage('dateRange')) {
      App.Utils.storage('dateRange', 'loadHourly');
    }

    function start() {
      (App.Model.Snapshot[App.Utils.storage('dateRange')] || _.noop)();
    }

    if (exports.firstRun) {
      setInterval(start, 1000 * 60 * 5); // update every 5 minutes
    }

    start();
    exports.firstRun = false;
  };

  $(exports.init);

});
