# STILL WORK IN PROGRESS
# Redis-Queues

Redis-Queues is a simple and light wrapper for redis clients to utilize both
LPUSH / BRPOP and PUBLISH / SUBSCRIBE methods for messaging. 
In other words Redis-Queues allows you to easily control whether published message will be handled multiple times or only once.


## How to Use

### Installation
```bash
npm install redis-queues
```

### Usage

#### Queue for publish

##### importing
```javascript
const PublishQueue = require('redis-queues').PublishQueue;
 
/// OR
 
const redisQueues = require('redis-queues');
const PublishQueue = redisQueues.PublishQueue;
 
```
##### Options
Bot queues need to be initialized with some options.
```javascript
const options = {
    redisPort: '16379', // needed when clients are not inserted on class init
    redisUrl: 'localhost', // needed when clients are not inserted on class init
    duplicateSubCli: true, // needed in subscribe queue when subscribeToOne function will be used to more than one key 
};
const clients = {
  publish: client, // used only in publishQueue, not needed for subscribeQueue
  subscribe: client, // used only in subscribeQueue, not needed for publishQueue
}
```
If you dont want Redis-queues to depend on node redis library, you can use another Redis library you prefer to initialize clients beforehand. I've only tested Redis library but others should work too.
The class constructor takes an options object as parameter and clients as and optional parameter. If clients object is not used, Redis-queues will depend on Redis to create the needed client.
If no clients object is used, redisPort and redisUrl properties are needed in the options object.

##### initializing the queue
Redis-queues can be used with already created redis clients or you can let it generate the clients for you by giving a redis port and url in the options parameter to the class constructor.
```javascript
const publishQueue = new PublishQueue(options, clients);
```

##### publishing messages to one receiver
Only one subscriber(the first) will handle the message 
```javascript
publishQueue.publishToOne(key, value);
```
##### publishing to messages to all receivers
All subscribers will receive and handle the message
```javascript
publishQueue.publishToMany(key, value);
```

#### Queue for subscribe

Subcribe queue will excecute a callback function when it receives a message. 

##### importing
```javascript
const SubscribeQueue = require('redis-queues').SubscribeQueue;
 
/// OR
 
const redisQueues = require('redis-queues');
const SubscribeQueue = redisQueues.SubscribeQueue;
 
```
##### initializing the queue
Redis-queues can be used with already created redis clients or you can let it generate the clients for you by giving a redis port and url in the options parameter to the class constructor.
```javascript
const subscribeQueue = new SubscribeQueue(options, clients);
```

##### Subscribing to to a key as one.
Only one subscriber(the first) will handle the message 
```javascript
subscribeQueue.subscribeToOne(key, callback);
```
##### Subscribing to to a key as many.
All subscribers will receive and handle the message
```javascript
subscribeQueue.subscribeToMany(key, callback);
```

##### Basic principles
IMPORTANT! subscribeToOne will only receive messages published using publishToOne method. 
subscribeToMany will only receive messages published using publishToMany method. They can not be used in parallel.
 
#### Unit Tests

Unit tests can be run using the following commands
```javascript
npm install
```
```javascript
npm run test
```

This library is still quite experimental. All improvement requests are warmly welcome.