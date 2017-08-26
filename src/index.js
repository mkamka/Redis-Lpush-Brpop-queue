const redis = require('./redis');
const Promise = require('bluebird');
const _ = require('lodash');

class RedisQueue {

  constructor(options, clients) {
    this.options = options;
    this.multiSub = options.multiSub || false;
    if (clients && clients.publish && clients.subscribe) {
      this.publishCli = clients.publish;
      this.subscribeCli = clients.subscribe;
    } else {
      this.subscribeCli = redis.createClient(options);
      this.publishCli = redis.createClient(options);
    }
  }

  publishToOne(key, obj) {
    this.publishCli.LPUSH(key, obj);
  };

  publishToMany(key, obj) {
    this.publishCli.publish(key, obj);
  };

  subscribeAsOne(key, func) {
    const clientDup = this.multiSub ? this.subscribeCli.duplicate() : this.subscribeCli;
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
      clientDup.BRPOP(eventKey, 0, cb);
    };
    onReceive(key, func);
  };

  subscribeAsMany(key, func) {
    const clientDup = this.multiSub ? this.subscribeCli.duplicate() : this.subscribeCli;
    clientDup.on('message', (channel, message) => {
      if (_.isEqual(channel, key)) {
        const ret = func(message);
        Promise.resolve(ret)
          .catch((err) => {
            console.error('Error on subscribe callback.', err);
          });
      }
    });
    clientDup.subscribe(key);
  };
}

module.exports = RedisQueue;
