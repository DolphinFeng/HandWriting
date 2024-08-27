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
                    resolve()
                    console.log(`SleepingFirst ${delay}`);
                }, delay)
            })
        })
        return this
    }

    sleep (delay) {
        this.push(() => {
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve()
                    console.log(`Sleeping ${delay}`);
                    
                }, delay)
            })
        })
        return this
    }

    eat (thing) {
        this.push(() => {
            console.log(`Eating ${thing}`);
            
        })
        return this
    }

    drink (thing) {
        this.push(() => {
            console.log(`Drinking ${thing}`);
            
        })
        return this
    }

    unshift (task) {
        this.queue.unshift(async () => {
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