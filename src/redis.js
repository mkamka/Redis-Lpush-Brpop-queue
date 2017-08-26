const redis = require('redis');
const bluebird = require('bluebird');

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

const createClient = (options) => {
  const { redisUrl, redisPort } = options;
  if (redisUrl && redisPort) {
    const client = redis.createClient(`redis://${redisUrl}:${redisPort}`);
    client.on('error', (err) => {
      throw `Could not connect to Redis, ${err}`;
    });
    return client;
  } else {
    throw 'No redisURL / redisPort in options'
  }
};

module.exports = {
  createClient,
};