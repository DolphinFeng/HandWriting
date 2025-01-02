import Worker from './worker.js?worker';

class Task {
  constructor(type, args) {
    this.type = type;
    this.args = args;
  }
}

class TaskWorker {
  available = false;
  resolve = null;
  reject = null;
  worker = null;

  constructor(notifyAvailable) {
    this.notifyAvailable = notifyAvailable;
    this.worker = new Worker();
    //在线程初始化完成后需要去领取已经存在的任务
    this.worker.onmessage = () => this.setAvailable();
  }

  dispatch({resolve, reject, task}) {
    this.available = false;
    this.worker.onmessage = ({data}) => {
      resolve(data);
      this.setAvailable();
    };
    this.worker.onerror = (e) => {
      reject(e);
      this.setAvailable();
    };
    this.worker.postMessage(task);
  }

  setAvailable() {
    this.available = true;
    this.resolve = null;
    this.reject = null;
    this.notifyAvailable();
  }
}

class WorkerPool {
  #taskQueue = [];
  #workers = [];

  constructor(poolSize) {
    for (let i = 0; i < poolSize; i++) {
      this.#workers.push(new TaskWorker(() => this.#dispatchIfAvailable()));
    }
  }

  start(type, postMessageArgs) {
    return new Promise((resolve, reject) => {
      this.#taskQueue.push({
        resolve,
        reject,
        task: new Task(type, postMessageArgs),
      });
      this.#dispatchIfAvailable();
    });
  }

  #dispatchIfAvailable() {
    if (!this.#taskQueue.length) {
      return;
    }
    for (let worker of this.#workers) {
      if (worker.available) {
        let a = this.#taskQueue.shift();
        worker.dispatch(a);
        break;
      }
    }
  }

  close() {
    for (let worker of this.#workers) {
      worker.worker.terminate();
    }
  }
}

export const poll = new WorkerPool(3);
