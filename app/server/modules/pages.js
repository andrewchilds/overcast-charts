var fs = require('fs');
var config = require('../../config');
var utils = require('./utils');

exports.routes = function (app) {
  app.get('/', utils.basicAuth, function (req, res) {
    utils.renderPageWithFingerprint(res, 'index');
  });
};
