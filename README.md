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

#### Queue for multiple receivers

##### importing
```javascript
const MultiReceiverQueue = require('redis-queues').MultiReceiverQueue;
 
/// OR
 
const redisQueues = require('redis-queues');
const MultiReceiverQueue = redisQueues.MultiReceiverQueue;
 
```
##### initializing the queue
Redis-queues can be used with already created redis clients or you can let it generate the clients for you by giving a redis port and url in the options parameter to the class constructor.
```javascript
const multiQueue = new MultiReceiverQueue(options, clients);
```

##### publishing messages to a key
```javascript
multiQueue.publish('testEvents', 'testing!');
```
##### subscribing to messages by key
```javascript
multiQueue.subscribe('testEvents', callback);
```

#### Queue for single receiver

##### importing
```javascript
const SingleReceiverQueue = require('redis-queues').SingleReceiverQueue;
 
/// OR
 
const redisQueues = require('redis-queues');
const SingleReceiverQueue = redisQueues.SingleReceiverQueue;
 
```
##### initializing the queue
Redis-queues can be used with already created redis clients or you can let it generate the clients for you by giving a redis port and url in the options parameter to the class constructor.
```javascript
const singleQueue = new SingleReceiverQueue(options, clients);
```

##### publishing messages to a key
```javascript
singleQueue.publish('testEvents', 'testing!');
```
##### subscribing to messages by key
```javascript
singleQueue.subscribe('testEvents', callback);
```