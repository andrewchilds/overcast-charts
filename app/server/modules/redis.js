var redis = require('redis');
var _ = require('lodash');
var config = require('../../config');

// console.log('Connecting to Redis client: ' + config.REDIS_HOSTNAME + ':' + config.REDIS_PORT);

var client = redis.createClient(config.REDIS_PORT, config.REDIS_HOSTNAME);

if (config.REDIS_PASSWORD) {
  client.auth(config.REDIS_PASSWORD, function () {
    (client.onReadyFn || _.noop)();
  });
}

client.on('error', function (err) {
  console.log('Error:', err);
});

module.exports = client;
