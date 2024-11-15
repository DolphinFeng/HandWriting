// HardMan("jack") 输出:
// I am jack

// HardMan("jack").rest(10).learn("computer") 输出
// I am jack
// 等待10秒
// Start learning after 10 seconds
// Learning computer

// HardMan("jack").restFirst(5).learn("chinese") 输出
// 等待5秒
// Start learning after 5 seconds
// I am jack
// Learning chinese

class HardWorker {
    constructor(name) {
      this.name = name;
      this.queue = [];
      // 使用setTimeout确保next方法在构造函数执行完后再执行
      setTimeout(() => {
        this.next();
      }, 0);
    }
  
    // 执行队列中的下一个任务
    next() {
      const fn = this.queue.shift();
      fn && fn();
    }
  
    // 添加一个休息任务到队列末尾
    rest(seconds) {
      this.queue.push(() => {
        console.log(`等待${seconds}秒`);
        setTimeout(() => {
          console.log(`Start learning after ${seconds} seconds`);
          this.next();
        }, seconds * 1000);
      });
      return this;
    }
  
    // 添加一个休息任务到队列开头
    restFirst(seconds) {
      this.queue.unshift(() => {
        console.log(`等待${seconds}秒`);
        setTimeout(() => {
          console.log(`Start learning after ${seconds} seconds`);
          this.next();
        }, seconds * 1000);
      });
      return this;
    }
  
    // 添加一个学习任务到队列末尾
    learn(subject) {
      this.queue.push(() => {
        console.log(`Learning ${subject}`);
        this.next();
      });
      return this;
    }
  
    // 输出名字
    sayName() {
      this.queue.push(() => {
        console.log(`I am ${this.name}`);
        this.next();
      });
      return this;
    }
  }
  
  // 创建一个HardWorker实例并返回
  function HardMan(name) {
      const worker = new HardWorker(name);
      return worker.sayName();
  }
  
  // 示例调用
  // HardMan("jack");
  HardMan("jack").rest(10).learn("computer");
  // HardMan("jack").restFirst(5).learn("chinese");
  