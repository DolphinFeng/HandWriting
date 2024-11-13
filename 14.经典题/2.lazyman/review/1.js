class LazyMan {
    queue = []

    constructor (name) {
        this.push(() => {
            console.log(`我叫 ${name}`)
        })
        setTimeout(() => {
            this.next()
        })
    }

    eat (thing) {
        this.push(() => {
            console.log(`我喜欢吃 ${thing}`)
        })
        return this
    }

    drink (thing) {
        this.push(() => {
            console.log(`我喝 ${thing}`)
        })
        return this
    }

    sleep (time) {
        this.push(() => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    console.log(`等待 ${time} ms`)
                    resolve()
                }, time)
            })
        })
        return this
    }

    sleepFirst (time) {
        this.unshift(() => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    console.log(`等待 ${time} ms`)
                    resolve()
                }, time)
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