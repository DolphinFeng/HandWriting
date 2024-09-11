class LazyMan {
    queue = []
    constructor (name) {
        this.push(() => {
            console.log(`I am ${name}`);
        })
        setTimeout(() => {
            this.next()
        })
    }

    eat (thing) {
        this.push(() => {
            console.log(`eating ${thing}`);
        })
        return this
    }

    drink (thing) {
        this.push(() => {
            console.log(`drinking ${thing}`);
        })
        return this
    }

    sleep (delay) {
        this.push(() => {
            return new Promise(resolve => {
                setTimeout(() => {
                    console.log(`sleep ${delay}`);
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
                    console.log(`sleep First ${delay}`);
                    resolve()
                }, delay)
            })
        })
        return this
    }

    push (task) {
        this.queue.push(async () => {
            await task()
            this.next()
        })
    }

    unshift (task) {
        this.queue.unshift(async () => {
            await task()
            this.next()
        })
    }

    next () {
        this.queue.shift()?.()
    }
}

new LazyMan('Dolphin').eat('food').sleep(2000).drink('water').sleepFirst('5000')