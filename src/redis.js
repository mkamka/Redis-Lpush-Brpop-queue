const redis = require('redis');

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