class LazyMan {
    queue = []
    constructor (name) {
        this.push(() => {
            console.log(`Hi! This is ${name}`);
        })
        setTimeout(() => {
            this.next()
        })
    }

    eat (thing) {
        this.push(() => {
            console.log(`Eat ${thing}`);
        })
        return this
    }

    drink (thing) {
        this.push(() => {
            console.log(`Drink ${thing}`);
        })
        return this
    }

    sleep (delay) {
        this.push(() => {
            return new Promise(resolve => {
                setTimeout(() => {
                    console.log(`Sleep ${delay} ms`);
                    resolve()
                }, delay)
            })
        })
        return this
    }

    sleepFirst (delay) {
        this.unshift(() => {
            return new Promise(resolve => {
                setTimeout(() => {
                    console.log(`Sleep ${delay} ms first`);
                    resolve()
                }, delay)
            })
        })
        return this
    }

    unshift (task) {
        this.queue.unshift(async() => {
            await task()
            this.next()
        })
    }

    push (task) {
        this.queue.push(async () => {
            await task()
            this.next()
        })
    }

    next () {
        this.queue.shift()?.()
    }
}

new LazyMan('Dolphin').eat('food').sleep(2000).drink('water').sleepFirst('5000')