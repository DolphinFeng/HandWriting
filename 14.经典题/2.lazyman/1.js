class LazyMan {
    queue = [];

    constructor(name) {
        this.push(() => {
            console.log(`我叫 ${name}`);
        });
        setTimeout(() => {
            this.next();
        });
    }

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

    drink(thing) {
        this.push(() => {
            console.log(`喝 ${thing}`);
        });
        return this;
    }

    eat(thing) {
        this.push(() => {
            console.log(`吃 ${thing}`);
        });
        return this;
    }

    push(task) {
        this.queue.push(async () => {
            await task();
            this.next();
        });
    }

    unshift(task) {
        this.queue.unshift(async () => {
            await task();
            this.next();
        });
    }

    next() {
        this.queue.shift()?.();
    }
}

// new LazyMan('煎饼狗子').drink('水')
new LazyMan('煎饼狗子').drink('水').sleep(3000).eat('憨包')
// new LazyMan('煎饼狗子').drink('可乐').sleepFirst(1000) 