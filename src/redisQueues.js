class RedisQueues {
  constructor(options, clients) {
    this.options = options;
    if(clients && clients.publish) {
      this.publishCli = clients.publish;
    }
    if (clients && clients.subscribe) {
      this.subscribeCli = clients.subscribe;
    }
  }
}

class PublishQueue extends RedisQueues {

  constructor(options, clients) {
    super(options, clients);
    if(!this.publishCli && options.redisPort && options.redisUrl) {
      const redis = require('./redis');
      this.publishCli = redis.createClient(options);
    }
  }

  publishToOne(key, obj) {
    if(this.publishCli) {
      this.publishCli.LPUSH(key, obj);
    } else {
      throw 'publishCli not set';
    }
  };

  publishToMany(key, obj) {
    if(this.publishCli) {
      this.publishCli.publish(key, obj);
    } else {
      throw 'publishCli not set';
    }
  };
}

class SubscribeQueue extends RedisQueues {

  constructor(options, clients) {
    super(options, clients);
    this.duplicateSubCli = options.duplicateSubCli || false;
    if(!this.subscribeCli && options.redisPort && options.redisUrl) {
      const redis = require('./redis');
      this.subscribeCli = redis.createClient(options);
    }
  }

  subscribeToMany(key, func) {
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

  subscribeToOne(key, func) {
    if(this.subscribeCli) {
      const clientDup = this.duplicateSubCli ? this.subscribeCli.duplicate() : this.subscribeCli;
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

module.exports = {
  PublishQueue,
  SubscribeQueue,
};
