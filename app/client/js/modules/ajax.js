App.module('Ajax', function (exports) {

  exports.active = 0;

  exports.ajax = function (options) {
    var complete = options.complete;
    exports.active++;
    options.complete = function () {
      exports.active--;
      if (complete) {
        complete.apply(this, arguments);
      }
    };
    jQuery.ajax(options);
  };

  _.each(['get', 'post', 'put', 'delete'], function (name) {
    exports[name] = function (options) {
      options.type = name.toUpperCase();
      exports.ajax(options);
    };
  });

});
