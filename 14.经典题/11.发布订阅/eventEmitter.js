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
        if (!this.event[type]) {
            return
        } else {
            this.event[type].forEach(cb => {
                cb(...args)
            })
        }
    }

    once (type, cb) {
        const fn = (...args) => {
            cb(...args)
            this.off(type, fn)
        }
        this.on(type, fn)
    }

    off (type, cb) {
        if (!this.event[type]) {
            return
        } else {
            this.event[type] = this.event[type].filter(item => item !== cb)
        }
    }
}

let ev = new EventEmitter()

const fn = (...args) => {
    console.log(...args);
}

ev.on('run', fn) // 订阅 'run' 事件
ev.emit('run', 123) // 触发 'run' 事件，输出 123

ev.on('say', fn) // 订阅 'say' 事件
ev.emit('say', 'hello') // 触发 'say' 事件，输出 hello
