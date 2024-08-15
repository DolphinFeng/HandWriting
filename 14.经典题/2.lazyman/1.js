class LazyMan {
    // 初始化任务队列
    queue = [];

    constructor(name) {
        // 将打印名字的任务加入队列
        this.push(() => {
            console.log(`我叫 ${name}`);
        });
        // 延迟执行队列中的任务
        setTimeout(() => {
            this.next();
        });
    }

    // 在队列前插入一个延迟任务
    sleepFirst(delay) {
        this.unshift(() => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    console.log(`等待 ${delay} ms`);
                    resolve();
                }, delay);
            });
        });
        return this;
    }

    // 在队列末尾添加一个延迟任务
    sleep(delay) {
        this.push(() => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    console.log(`等待 ${delay} ms`);
                    resolve();
                }, delay);
            });
        });
        return this;
    }

    // 在队列末尾添加一个喝东西的任务
    drink(thing) {
        this.push(() => {
            console.log(`喝 ${thing}`);
        });
        return this;
    }

    // 在队列末尾添加一个吃东西的任务
    eat(thing) {
        this.push(() => {
            console.log(`吃 ${thing}`);
        });
        return this;
    }

    // 将任务添加到队列末尾
    push(task) {
        this.queue.push(async () => {
            await task();
            this.next();
        });
    }

    // 将任务添加到队列开头
    unshift(task) {
        this.queue.unshift(async () => {
            await task();
            this.next();
        });
    }

    // 执行队列中的下一个任务
    next() {
        this.queue.shift()?.();
    }
}

// 示例用法
// new LazyMan('煎饼狗子').drink('水')
// new LazyMan('煎饼狗子').drink('水').sleep(3000).eat('憨包')
new LazyMan('煎饼狗子').drink('可乐').sleepFirst(1000)
