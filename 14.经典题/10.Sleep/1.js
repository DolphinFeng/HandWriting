// 定义了一个 Sleep 类，用于实现一个延迟功能。通过 await 关键字，可以在异步函数中暂停执行一段时间

class Sleep {
    constructor(timeout) {
      this.timeout = timeout;
    }
    then(resolve, reject) {
      const startTime = Date.now();
      setTimeout(
        () => resolve(Date.now() - startTime),
        this.timeout
      );
    }
  }
  
  (async () => {
    const sleepTime = await new Sleep(1000);
    console.log(sleepTime);
  })();