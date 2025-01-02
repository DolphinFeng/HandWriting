import {taskHandler} from './routes.js';
import {TaskResult} from './task-result.js';

self.onmessage = function ({data}) {
  taskHandler
    .dispatch(data.type, data.args)
    .then((res) => {
      self.postMessage(new TaskResult(200, 'success', res));
    })
    .catch((err) => {
      console.log('taskHandler catch');
      console.error(err);
      self.postMessage(new TaskResult(500, 'fail', err));
    });
};

self.postMessage('ready');
