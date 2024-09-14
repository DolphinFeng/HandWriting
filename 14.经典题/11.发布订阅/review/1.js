class EventEmitter {
    constructor () {
        this.events = {}
    }

    on (type, cb) {
        if (!this.events[type]) {
            this.events[type] = [cb]
        } else {
            this.events[type].push(cb)
        }       
    }

    emit (type, ...args) {
        if (!this.events[type]) return
        this.events[type].forEach(cb => cb(...args))
    }

    off (cb, type) {
        if (!this.events[type]) return
        this.events[type] = this.events[type].filter(item => item !== cb)
    }

    once (cb, type) {
        const fn = (...args) => {
            cb(...args)
            this.off(fn, type)
        }
        this.on(type, fn)
    }
}

let ev = new EventEmitter()

const fn = (...args) => {
    console.log(...args);
    
}

// ev.on('run', fn)
ev.once(fn, 'run')
ev.emit('run', 123)
ev.emit('run', 123)