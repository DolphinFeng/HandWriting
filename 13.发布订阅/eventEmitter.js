class EventEmitter {
    constructor() {
        this.event = {} // 存事件
    }
    
    on(type, cb) { // 订阅
        if (!this.event[type]) { // 事件不存在就以数组的形式记录下来
            this.event[type] = [cb]
        } else { // 存在就再放进去
            this.event[type].push(cb)
        }
    }
    emit(type, ...args) {
        if (!this.event[type]) {
            return 
        } else {
            this.event[type].forEach(cb => {
                cb(...args)
            })
        }
    }
    off(type, cb) { // 取消事件
        if (!this.event[type]) {
            return 
        } else {
            this.event[type] = this.event[type].filter(item => item !== cb)
        }
    }  
    once(type, cb) { // 只能订阅一次  因此调用一次后，取消
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

ev.on('run', fn)
ev.emit('run', 123)

ev.on('say', fn)
ev.emit('say', 'hello')