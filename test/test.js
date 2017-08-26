const Promise = require('bluebird');
const chai = require('chai');
const redisQueue = require('../src/index.js');
const fakeRedis = require("fakeredis");
const expect = chai.expect;

const options = {
  //redisPort: '16379',
  //redisUrl: 'localhost',
  multiSub: true,
};

const clients = {
  publish: fakeRedis.createClient('test'),
  subscribe: fakeRedis.createClient('test'),
};
const testQueue = new redisQueue(options, clients);

describe('Redis queue ', function() {
  describe ('to and as one', function() {
    it('can subscribe to a queue an then receive messages from it', function () {
      testQueue.subscribeAsOne('testEvents', (message) => {
        expect(message).to.equal('testing!');
      });
      testQueue.publishToOne('testEvents', 'testing!');
    });
    it('if it has two or more subscribers to the same key , will handle sent message only once', function(){
      const messages = [];
      testQueue.subscribeAsOne('testEventsTwo', (message) => {
        messages.push(message);
      });
      testQueue.subscribeAsOne('testEventsTwo', (message) => {
        messages.push(message);
      });
      testQueue.subscribeAsOne('testEventsTwo', (message) => {
        messages.push(message);
      });
      testQueue.publishToOne('testEventsTwo', 'testing!');
      Promise.delay(2000).then(() => expect(messages.length).to.equal(1));
    });
  });

  describe ('to and as many', function() {
    it('can subscribe to a queue an then receive messages from it', function () {
      testQueue.subscribeAsMany('testEvents', (message) => {
        expect(message).to.equal('testing!');
      });
      testQueue.publishToMany('testEvents', 'testing!');
    });
    it('if it has two or more subscribers to the same key , every client will receive the message', function(){
      const messages = [];
      testQueue.subscribeAsMany('testEventsTwo', (message) => {
        messages.push(message);
      });
      testQueue.subscribeAsMany('testEventsTwo', (message) => {
        messages.push(message);
      });
      testQueue.subscribeAsMany('testEventsTwo', (message) => {
        messages.push(message);
      });
      testQueue.publishToMany('testEventsTwo', 'testing!');
      Promise.delay(2000).then(() => expect(messages.length).to.equal(3));
    });
  });
});