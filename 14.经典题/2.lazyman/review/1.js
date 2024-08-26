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

    sleepFirst (delay) {
        this.unshift(() => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    console.log(`sleepFirst ${delay}`);
                    resolve()
                }, delay)
            })
        })
        return this
    }

    sleep (delay) {
        this.push(() => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    console.log(`sleep ${delay}`);
                    resolve()
                }, delay)
            })
        })
        return this
    }

    drink (thing) {
        this.push(() => {
            console.log(`drink ${thing}`);
            
        })
        return this
    }

    eat (thing) {
        this.push(() => {
            console.log(`eat ${thing}`);
            
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

new LazyMan('Jack').eat('rice').sleep(1000).drink('water').sleepFirst(2000)