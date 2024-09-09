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
        }
        this.event[type].forEach(cb => {
            cb(...args)
        })
    }

    once (type, cb) {
        const fn = (...args) => {
            cb(...args)
            this.off(fn)
        }
        this.on(type, fn)
    }

    off (type, cb) {
        if (!this.event[type]) return 
        this.event[type].filter(item => item !== cb) 
    }
}

let ev = new EventEmitter()

const fn = (...args) => {
    console.log(...args);
}

// ev.on('run', fn)
ev.emit('run', 111)

ev.once('say', fn)
ev.emit('say', 111)
ev.emit('say', 111)