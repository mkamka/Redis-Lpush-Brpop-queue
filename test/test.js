const Promise = require('bluebird');
const chai = require('chai');
const PublishQueue = require('../src/redisQueues').PublishQueue;
const SubscribeQueue = require('../src/redisQueues').SubscribeQueue;
const fakeRedis = require("fakeredis");
const expect = chai.expect;

const presetOptions = {
  //redisPort: '16379',
  //redisUrl: 'localhost',
  duplicateSubCli: true,
};

const unsetOptions = {
  redisPort: '16379',
  redisUrl: 'localhost',
  duplicateSubCli: true,
};

const presetclients = {
  publish: fakeRedis.createClient('test'),
  subscribe: fakeRedis.createClient('test'),
};
const publishQueue = new PublishQueue(presetOptions, presetclients);
const subscribeQueue = new SubscribeQueue(presetOptions, presetclients);

const publishQueueUnset = new PublishQueue(unsetOptions);
const subscribeQueueUnset = new SubscribeQueue(unsetOptions);

describe('Redis queue with pre set Redis clients', function() {
  describe ('to and as one', function() {
    it('can subscribe to a queue an then receive messages from it', function () {
      subscribeQueue.subscribeToOne('testEvents', (message) => {
        expect(message).to.equal('testing!');
      });
      publishQueue.publishToOne('testEvents', 'testing!');
    });
    it('if it has two or more subscribers to the same key , will handle sent message only once', function(){
      const messages = [];
      subscribeQueue.subscribeToOne('testEventsTwo', (message) => {
        messages.push(message);
      });
      subscribeQueue.subscribeToOne('testEventsTwo', (message) => {
        messages.push(message);
      });
      subscribeQueue.subscribeToOne('testEventsTwo', (message) => {
        messages.push(message);
      });
      publishQueue.publishToOne('testEventsTwo', 'testing!');
      Promise.delay(2000).then(() => expect(messages.length).to.equal(1));
    });
  });

  describe ('to and as many', function() {
    it('can subscribe to a queue an then receive messages from it', function () {
      subscribeQueue.subscribeToMany('testEvents', (message) => {
        expect(message).to.equal('testing!');
      });
      publishQueue.publishToMany('testEvents', 'testing!');
    });
    it('if it has two or more subscribers to the same key , every client will receive the message', function(){
      const messages = [];
      subscribeQueue.subscribeToMany('testEventsTwo', (message) => {
        messages.push(message);
      });
      subscribeQueue.subscribeToMany('testEventsTwo', (message) => {
        messages.push(message);
      });
      subscribeQueue.subscribeToMany('testEventsTwo', (message) => {
        messages.push(message);
      });
      publishQueue.publishToMany('testEventsTwo', 'testing!');
      Promise.delay(2000).then(() => {
        expect(messages.length).to.equal(3)
      });
    });
  });
});

describe('Redis queue without pre set Redis clients', function() {
  describe ('to and as one', function() {
    it('can subscribe to a queue an then receive messages from it', function () {
      subscribeQueueUnset.subscribeToOne('testEvents', (message) => {
        expect(message).to.equal('testing!');
      });
      publishQueueUnset.publishToOne('testEvents', 'testing!');
    });
    it('if it has two or more subscribers to the same key , will handle sent message only once', function(){
      const messages = [];
      subscribeQueueUnset.subscribeToOne('testEventsTwo', (message) => {
        messages.push(message);
      });
      subscribeQueueUnset.subscribeToOne('testEventsTwo', (message) => {
        messages.push(message);
      });
      subscribeQueueUnset.subscribeToOne('testEventsTwo', (message) => {
        messages.push(message);
      });
      publishQueueUnset.publishToOne('testEventsTwo', 'testing!');
      Promise.delay(2000).then(() => expect(messages.length).to.equal(1));
    });
  });

  describe ('to and as many', function() {
    it('can subscribe to a queue an then receive messages from it', function () {
      subscribeQueueUnset.subscribeToMany('testEventsUnset', (message) => {
        expect(message).to.equal('testing!');
      });
      publishQueueUnset.publishToMany('testEventsUnset', 'testing!');
    });
    it('if it has two or more subscribers to the same key , every client will receive the message', function(){
      const messages = [];
      subscribeQueueUnset.subscribeToMany('testEventsTwoUnset', (message) => {
        messages.push(message);
      });
      subscribeQueueUnset.subscribeToMany('testEventsTwoUnset', (message) => {
        messages.push(message);
      });
      subscribeQueueUnset.subscribeToMany('testEventsTwoUnset', (message) => {
        messages.push(message);
      });
      publishQueueUnset.publishToMany('testEventsTwoUnset', 'testing!');
      Promise.delay(2000).then(() => {
        expect(messages.length).to.equal(3)
      });
    });
  });
});