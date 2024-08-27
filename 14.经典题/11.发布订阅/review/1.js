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

const fn1 = (...args) => {
    console.log(...args, '----');
    
}

// ev.on('run', fn)
// ev.on('run', fn1)
// ev.off('run', fn)
// ev.emit('run', 123)
// ev.emit('run', 456)

ev.once('jump', fn)
ev.emit('jump', 1111)
ev.emit('jump', 2222)