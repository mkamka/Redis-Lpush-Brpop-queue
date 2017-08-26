const redis = require('./redis');
const Promise = require('bluebird');

class RedisLpushBRPopQueue {

  constructor(options) {
    this.options = options;
    this.subscribeCli = redis.createClient(options);
    this.publishCli = redis.createClient(options);
  }

  subscribe(key, func) {
    const clientDup = this.subscribeCli.duplicate();
    const onReceive = (eventKey, handlerfunc) => {
      const cb = (e, reply) => {
        const [, message] = reply;
        const ret = handlerfunc(message);
        Promise.resolve(ret)
          .catch((err) => {
            console.error('Error on subscribe callback.', err);
          }).finally(() => {
          onReceive(eventKey, handlerfunc);
        });
      };
      clientDup.brpop(eventKey, 0, cb);
    };
    onReceive(key, func);
  };

  publish(key, obj) {
    this.publishCli.lpush(key, obj);
  };
}

export default RedisLpushBRPopQueue;
