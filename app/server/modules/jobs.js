// crontab:
// -----------------------------------------------------------------------------
// # m     h     d     m     w     command
//   */5   *     *     *     *     /path/to/overcast-charts/bin/snapshot >/dev/null 2>&1
//   2     *     *     *     *     /path/to/overcast-charts/bin/weekly >/dev/null 2>&1
//   2     */4   *     *     *     /path/to/overcast-charts/bin/monthly >/dev/null 2>&1

var cp = require('child_process');
var _ = require('lodash');
var Promise = require('bluebird');
var constants = require('./constants.js');
var redis = require('./redis.js');
var utils = require('./utils.js');

var BATCH_SIZE = 10; // number of servers to hit at once

var EXEC_OPTIONS = {
  env: _.extend({}, process.env, {
    PATH: '/usr/local/bin:' + process.env.PATH
  })
};

exports.snapshot = function () {
  utils.getInstanceList(function (instances) {
    batchRun(instances, BATCH_SIZE, getInstanceHealthSnapshot);
  });
};

exports.weekly = function () {
  pushSnapshotInstances('WEEKLY');
};

exports.monthly = function () {
  pushSnapshotInstances('MONTHLY');
};

function batchRun(list, batchSize, fn) {
  console.log('----------');
  var promises = [];
  while (list.length > 0 && promises.length < batchSize) {
    promises.push(fn(list.shift()));
  }
  Promise.all(promises).then(function () {
    if (list.length > 0) {
      batchRun(list, batchSize, fn);
    } else {
      utils.promiseDoneHandler();
    }
  }).catch(utils.promiseErrorHandler);
}

function getInstanceHealthSnapshot(instanceName) {
  instanceName = utils.sanitize(instanceName);

  return new Promise(function (resolve, reject) {
    console.log('starting to get health for ' + instanceName + '...');

    cp.exec('overcast health ' + instanceName, EXEC_OPTIONS, function (err, stdout, stderr) {
      console.log('exec done for ' + instanceName + '...');
      if (err) {
        console.log('Overcast returned an error:', err);
        console.log('Continuing...');
        resolve();
      } else {
        var now = _.now();
        var processes = [];
        try {
          stdout = JSON.parse(stdout);
          stdout = stdout[instanceName];
          processes = stdout.processes;
          delete stdout.processes;
        } catch (e) {
          stdout = { error: 'JSON parse error.' };
        }
        var data = JSON.stringify({
          timestamp: now,
          data: stdout
        });
        redis.set(constants.KEYS.PROCESSES + '.' + instanceName, JSON.stringify(processes), function () {
          redis.set(constants.KEYS.SNAPSHOT + '.' + instanceName, data, function () {
            pushFromSnapshot('DAILY', instanceName, resolve);
          });
        });
      }
    });
  });
}

function pushSnapshotInstances(key) {
  utils.withInstances(function (instanceName, resolve, reject) {
    pushFromSnapshot(key, instanceName, resolve);
  });
}

function pushFromSnapshot(key, instanceName, callback) {
  instanceName = utils.sanitize(instanceName);
  redis.get(constants.KEYS.SNAPSHOT + '.' + instanceName, function (err, data) {
    redis.lpush(constants.KEYS[key] + '.' + instanceName, data, function () {
      redis.ltrim(constants.KEYS[key] + '.' + instanceName, 0, constants.LIMITS[key], function () {
        (callback || _.noop)();
      });
    });
  });
}
