var _ = require('lodash');
var Promise = require('bluebird');
var constants = require('./constants.js');
var redis = require('./redis.js');
var utils = require('./utils.js');

exports.routes = function (app) {
  app.get('/daily', utils.basicAuth, function (req, res) {
    getChartData(res, 'DAILY');
  });
  app.get('/weekly', utils.basicAuth, function (req, res) {
    getChartData(res, 'WEEKLY');
  });
  app.get('/monthly', utils.basicAuth, function (req, res) {
    getChartData(res, 'MONTHLY');
  });
};

function getChartData(res, key) {
  var promiseFn = function (instanceName, resolve, reject) {
    redis.lrange(constants.KEYS[key] + '.' + instanceName, 0, constants.LIMITS[key], function (err, data) {
      redis.get(constants.KEYS.PROCESSES + '.' + instanceName, function (err, processes) {
        resolve({
          data: data,
          processes: processes,
          name: instanceName
        });
      });
    });
  };

  utils.withInstances(promiseFn, function (data) {
    res.json(data);
  });
}
