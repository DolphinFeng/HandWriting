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

    next () {
        this.queue.shift()?.()
    }

    rest (delay) {
        this.queue.push(() => {
            console.log(`waiting for ${delay}`);
            setTimeout(() => {
                console.log(`resting ${delay}`);
                this.next()
                
            }, delay)
        })
        return this
    }

    restFirst (delay) {
        this.queue.unshift(() => {
            console.log(`waiting for ${delay}`);
            setTimeout(() => {
                console.log(`restingFirst ${delay}`);
                this.next()
            }, delay)
            
        })
        return this
    }

    learn (subject) {
        this.queue.push(() => {
            console.log(`learning ${subject}`);
            this.next()
            
        })
        return this
    }

    sayName () {
        this.queue.push(() => {
            console.log(`${this.name}`);
            this.next()
        })
        return this
    }
}

function HardMan (name) {
    return new HardWorker(name).sayName()
}

HardMan('Dolphin').learn('Chinese').restFirst(3000)