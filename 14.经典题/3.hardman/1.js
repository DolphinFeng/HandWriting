// HardMan("jack") 输出:
// I am jack

// HardMan("jack").rest(10).learn("computer") 输出
// I am jack
// x等待10秒
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
    console.log(`I am ${name}`);
    setTimeout(() => {
      this.next();
    }, 0);
  }

  next() {
    const fn = this.queue.shift();
    fn && fn();
  }

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

  learn(subject) {
    this.queue.push(() => {
      console.log(`Learning ${subject}`);
      this.next();
    });
    return this;
  }
}


function HardMan(name) {
    return new HardWorker(name);
}

// HardMan("jack");
// HardMan("jack").rest(10).learn("computer");
HardMan("jack").restFirst(5).learn("chinese");