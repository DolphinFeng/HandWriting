class EventEmitter {
    constructor () {
        this.event = {}
    }

    on (type, cb) {
        if (!this.event[type]) {
            this.event[type] = [cb]
        } else {
            this.event[type].push(cb)
        }
    }

    emit (type, ...args) {
        if (!this.event[type]) return
        this.event[type].forEach(cb => {
            cb(...args)
        })
    }

    off (type, cb) {
        if (!this.event[type]) return
        this.event[type] = this.event[type].filter(item => item !== cb)
    }

    once (type, cb) {
        const fn = (...args) => {
            cb(...args)
            this.off(type, fn)
        }

        this.on(type, fn)
    }
}

let ev = new EventEmitter()

const fn = (...args) => {
    console.log(...args);
    
}

// ev.on('run', fn) 
// ev.emit('run', 123)

// ev.on('say', fn)
// ev.emit('say', 'hello')

// 使用 once 方法订阅 'jump' 事件
ev.once('jump', fn)
ev.emit('jump', 'first jump') // 触发 'jump' 事件，输出 'first jump'
ev.emit('jump', 'second jump') // 不会输出，因为 once 只触发一次

// 使用 on 方法订阅 'walk' 事件
ev.on('walk', fn)
ev.emit('walk', 'first walk') // 触发 'walk' 事件，输出 'first walk'

// 使用 off 方法取消 'walk' 事件的订阅
ev.off('walk', fn)
ev.emit('walk', 'second walk') // 不会输出，因为 'walk' 事件已被取消订阅