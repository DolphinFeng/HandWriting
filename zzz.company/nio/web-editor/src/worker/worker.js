import {taskHandler} from './routes.js';
import {TaskResult} from './taskResult.js';

self.onmessage = function ({data}) {
  taskHandler
    .dispatch(data.type, data.args)
    .then((res) => {
      self.postMessage(new TaskResult(200, 'success', res));
    })
    .catch((err) => {
      console.log('taskHandler catch');
      self.postMessage(new TaskResult(500, 'fail', err));
    });
};

self.postMessage('ready');
