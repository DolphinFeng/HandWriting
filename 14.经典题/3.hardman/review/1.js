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
    constructor (name) {
        this.name = name
        this.queue = []
        setTimeout(() => {
            this.next()
        })
    }

    sayName () {
        this.queue.push(() => {
            console.log(`I am ${this.name}`)
            this.next()
        })
        return this
    }

    learn (thing) {
        this.queue.push(() => {
            console.log(`Learning ${thing}`)
            this.next()
        })
        return this
    }

    rest (delay) {
        this.queue.push(() => {
            return new Promise((resolve) => {
                console.log(`等待${delay}秒`);
                setTimeout(() => {
                    console.log(`Start learning after ${delay} seconds`);
                    resolve()
                    this.next();
                }, delay)
            })
        })
        return this
    }

    restFirst (delay) {
        this.queue.unshift(() => {
            return new Promise((resolve) => {
                console.log(`等待${delay}秒`);
                setTimeout(() => {
                    console.log(`Start learning after ${delay} seconds`);
                    resolve()
                    this.next();
                }, delay)
            })
        })
        return this
    }

    next () {
        const fn = this.queue.shift()
        fn && fn()
    }
}

function HardMan (name) {
    return new HardWorker(name).sayName()
}

HardMan('Dolphin').learn('Chinese').restFirst(3000)