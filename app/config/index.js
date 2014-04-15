var fs = require('fs');
var appEnvironment;

function sanitize(str) {
  return (str || '').replace(/\W/g, '');
}

function loadEnvironmentConfig() {
  appEnvironment = sanitize(process.env.NODE_ENV || 'development');
  var configFile = __dirname + '/' + appEnvironment + '.json';

  if (!fs.existsSync(configFile)) {
    console.error('Config file not found: ' + configFile);
    process.exit(1);
  }

  return require(configFile);
}

module.exports = loadEnvironmentConfig();

module.exports.environment = appEnvironment;

['Test', 'Development', 'Production'].forEach(function (name) {
  module.exports['is' + name + 'Environment'] = function () {
    return appEnvironment === name.toLowerCase();
  };
});
