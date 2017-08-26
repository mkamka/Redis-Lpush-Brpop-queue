const redisQueue = require('../src/index.js');

const options = {
  redisPort: '16379',
  redisUrl: 'localhost'
};

const testQueue = new redisQueue(options);

testQueue.subscribe('testEvents', (message) => {
  console.log('Received message: ', message);
});

testQueue.publish('testEvents', 'miikka testaa!');