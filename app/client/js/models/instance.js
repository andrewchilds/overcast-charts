App.module('Model.Instance', function (exports) {

  exports = Collectionize('Instance');

  exports.on('beforeAdd', function (instance) {
    _.each(instance.processes, function (process) {
      process.name = _.last(_.first(process.command.split(' ')).split('/'));
    });
  });

  return exports;

});
