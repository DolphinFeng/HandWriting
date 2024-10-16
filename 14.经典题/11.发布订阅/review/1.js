class EventEmitter {
    constructor () {
        this.events = {}
    }

    on (type, cb) {
        if (!this.events[type]) {
            this.events[type] = []
        }
        this.events[type].push(cb)
    }

    emit (type, ...args) {
        if (!this.events[type]) return
        this.events[type].forEach(cb => {
            cb(...args)
        })
    }

    off (type, cb) {
        if (!this.events[type]) {
            return 
        }
        this.events[type] = this.events[type].filter(item => item !== cb)
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

// ev.once('run', fn)
// ev.emit('run', 123)
// ev.emit('run', 123)

// ev.on('run', fn)
ev.emit('run', 123)
ev.emit('run', 123)