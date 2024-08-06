class EventEmitter {
    constructor() {
        this.event = {} // 存储事件及其对应的回调函数
    }
    
    /**
     * 订阅事件
     * @param {string} type - 事件类型
     * @param {function} cb - 回调函数
     */
    on(type, cb) {
        if (!this.event[type]) { // 如果事件不存在，则创建一个数组来存储回调函数
            this.event[type] = [cb]
        } else { // 如果事件已存在，则将回调函数添加到数组中
            this.event[type].push(cb)
        }
    }

    /**
     * 触发事件
     * @param {string} type - 事件类型
     * @param {...any} args - 传递给回调函数的参数
     */
    emit(type, ...args) {
        if (!this.event[type]) { // 如果事件不存在，则直接返回
            return 
        } else { // 如果事件存在，则依次执行所有回调函数
            this.event[type].forEach(cb => {
                cb(...args)
            })
        }
    }

    /**
     * 取消订阅事件
     * @param {string} type - 事件类型
     * @param {function} cb - 回调函数
     */
    off(type, cb) {
        if (!this.event[type]) { // 如果事件不存在，则直接返回
            return 
        } else { // 如果事件存在，则移除指定的回调函数
            this.event[type] = this.event[type].filter(item => item !== cb)
        }
    }  

    /**
     * 订阅一次性事件
     * @param {string} type - 事件类型
     * @param {function} cb - 回调函数
     */
    once(type, cb) {
        const fn = (...args) => {
            cb(...args) // 执行回调函数
            this.off(type, fn) // 执行一次后取消订阅
        }
        this.on(type, fn) // 订阅事件
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
