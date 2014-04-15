var express = require('express');
var http = require('http');
var https = require('https');
var fs = require('fs');
var config = require('../config');

var app = express();

app.configure(function () {
  app.set('port', process.env.PORT || config.PORT || 3000);
  app.set('views', __dirname + '/../views');
  app.set('view engine', 'jade');
  app.use(express.logger('dev'));
  app.use(express.json());
  app.use(express.urlencoded());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(app.router);
  app.use(express.static(__dirname + '/../../public'));
});

app.configure('development', function () {
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function () {
  app.use(express.errorHandler());
});

require('./modules/pages.js').routes(app);
require('./modules/charts.js').routes(app);

http.createServer(app).listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'));
});
