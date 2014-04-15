var fs = require('fs');
var cp = require('child_process');
var express = require('express');
var _ = require('lodash');
var Promise = require('bluebird');
var constants = require('./constants.js');
var redis = require('./redis.js');
var config = require('../../config');

var EXEC_OPTIONS = {
  env: _.extend({}, process.env, {
    PATH: '/usr/local/bin:' + process.env.PATH
  })
};

var utils = {};
module.exports = utils;

utils.promiseErrorHandler = function (err) {
  console.error('Script error:', err);
  process.exit(1);
};

utils.promiseDoneHandler = function () {
  console.error('Done!');
  process.exit(0);
};

utils.getInstanceList = function (fn) {
  cp.exec('overcast instance list', EXEC_OPTIONS, function (err, stdout, stderr) {
    var instances = [];
    if (err) {
      console.log('Overcast error:', err, stdout, stderr);
    }
    if (stdout) {
      instances = (stdout + '').trim().split("\n");
    }
    fn(instances);
  });
};

utils.withInstances = function (promiseFn, thenFn) {
  utils.getInstanceList(function (instances) {
    var promises = [];
    _.each(instances, function (instance) {
      promises.push(new Promise(function (resolve, reject) {
        promiseFn(instance, resolve, reject);
      }));
    });

    Promise.all(promises).catch(utils.promiseErrorHandler).then(function (data) {
      (thenFn || utils.promiseDoneHandler)(data);
    });
  });
};

utils.sanitize = function (str) {
  if (!str) {
    str = '';
  } else if (!str.replace) {
    str = str + '';
  }
  return str.replace(/[^0-9a-zA-Z\.\-\_ ]/g, '');
};

utils.renderPageWithFingerprint = function (res, template) {
  fs.readFile(__dirname + '/../../../fingerprint', function (err, fingerprint) {
    if (err) {
      console.log('Fingerprint file not found, using current timestamp instead.');
    }
    res.render(template, {
      timestamp: fingerprint || new Date().getTime(),
      environment: config.environment
    });
  });
};

if (config.BASICAUTH_USER && config.BASICAUTH_PASSWORD) {
  utils.basicAuth = express.basicAuth(function (user, pass) {
     return user === config.BASICAUTH_USER && pass === config.BASICAUTH_PASSWORD;
  }, 'Password, please');
} else {
  utils.basicAuth = function (req, res, next) {
    next();
  };
}
