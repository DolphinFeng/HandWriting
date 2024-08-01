class EventEmitter {
    consturctor () {
        this.event = {}
    }

    on (type, cb) { // 订阅
        if (!this.event[type]) { // 若不存在
            this.event[type] = [cb] 
        } else { // 存在多个
            this.event[type].push(cb)
        }
    }

    once (type, cb) { // 订阅一次
        const fn = (...args) => {
            cb(...args)
            this.off(type, fn)
        }
        this.on(type, fn)
    }

    emit (type, ...args) { // 发布
        if (!this.event[type]) {
            return 
        } else {
            this.event[type].forEach(cb => {
                cb(...args)
            })
        }   
    }

    off (type, cb) { // 关闭
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

ev.on('run', fn)
ev.emit('run', 123)

ev.on('say', fn)
ev.emit('say', 'hello')