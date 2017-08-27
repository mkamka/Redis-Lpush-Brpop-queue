const Promise = require('bluebird');
const chai = require('chai');
const MultiReceiverQueue = require('../src/redisQueues').MultiReceiverQueue;
const SingleReceiverQueue = require('../src/redisQueues').SingleReceiverQueue;
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
const testSingleRecQueue = new SingleReceiverQueue(options, clients);
const testMultiRecQueue = new MultiReceiverQueue(options, clients);

describe('Redis queue ', function() {
  describe ('to and as one', function() {
    it('can subscribe to a queue an then receive messages from it', function () {
      testSingleRecQueue.subscribe('testEvents', (message) => {
        expect(message).to.equal('testing!');
      });
      testSingleRecQueue.publish('testEvents', 'testing!');
    });
    it('if it has two or more subscribers to the same key , will handle sent message only once', function(){
      const messages = [];
      testSingleRecQueue.subscribe('testEventsTwo', (message) => {
        messages.push(message);
      });
      testSingleRecQueue.subscribe('testEventsTwo', (message) => {
        messages.push(message);
      });
      testSingleRecQueue.subscribe('testEventsTwo', (message) => {
        messages.push(message);
      });
      testSingleRecQueue.publish('testEventsTwo', 'testing!');
      Promise.delay(2000).then(() => expect(messages.length).to.equal(1));
    });
  });

  describe ('to and as many', function() {
    it('can subscribe to a queue an then receive messages from it', function () {
      testMultiRecQueue.subscribe('testEvents', (message) => {
        expect(message).to.equal('testing!');
      });
      testMultiRecQueue.publish('testEvents', 'testing!');
    });
    it('if it has two or more subscribers to the same key , every client will receive the message', function(){
      const messages = [];
      testMultiRecQueue.subscribe('testEventsTwo', (message) => {
        messages.push(message);
      });
      testMultiRecQueue.subscribe('testEventsTwo', (message) => {
        messages.push(message);
      });
      testMultiRecQueue.subscribe('testEventsTwo', (message) => {
        messages.push(message);
      });
      testMultiRecQueue.publish('testEventsTwo', 'testing!');
      Promise.delay(2000).then(() => expect(messages.length).to.equal(3));
    });
  });
});