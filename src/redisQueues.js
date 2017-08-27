const redis = require('./redis');

class RedisQueues {
  constructor(options, clients) {
    this.options = options;
    if (clients) {
      if(clients.publish) {
        this.publishCli = clients.publish;
      }
      if (clients.subscribe) {
        this.subscribeCli = clients.subscribe;
      }
    } else {
      this.subscribeCli = redis.createClient(options);
      this.publishCli = redis.createClient(options);
    }
  }
}

class SingleReceiverQueue extends RedisQueues {

  constructor(options, clients) {
    super(options, clients);
    this.multiSub = options.multiSub || false;
  }

  publish(key, obj) {
    if(this.publishCli) {
      this.publishCli.LPUSH(key, obj);
    } else {
      throw 'publishCli not set';
    }
  };

  subscribe(key, func) {
    if(this.subscribeCli) {
      const clientDup = this.multiSub ? this.subscribeCli.duplicate() : this.subscribeCli;
      const onReceive = (eventKey, handlerfunc) => {
        const cb = (e, reply) => {
          const [, message] = reply;
          handlerfunc(message);
        };
        clientDup.BRPOP(eventKey, 0, cb);
      };
      onReceive(key, func);
    } else {
      throw 'subscribeCli not set';
    }
  };
}

class MultiReceiverQueue extends RedisQueues {

  constructor(options, clients) {
    super(options, clients);
  }
  publish(key, obj) {
    if(this.publishCli) {
      this.publishCli.publish(key, obj);
    } else {
      throw 'publishCli not set';
    }
  };

  subscribe(key, func) {
    if(this.subscribeCli) {
      this.subscribeCli.on('message', (channel, message) => {
        if (channel === key) {
          func(message);
        }
      });
      this.subscribeCli.subscribe(key);
    } else {
      throw 'subscribeCli not set';
    }
  };
}

module.exports = {
  MultiReceiverQueue,
  SingleReceiverQueue,
};
