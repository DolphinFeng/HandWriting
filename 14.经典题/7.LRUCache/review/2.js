class LRUCache {
    constructor (capacity, timeout) {
        this.capacity = capacity
        this.timeout = timeout
        this.cache = new Map()
        this.timers = new Map()
    }

    get (key) {
        if (!this.cache.has(key)) return -1
        const value = this.cache.get(key)
        this.cache.delete(key)
        this.cache.set(key, value)
        this._resetTimer(key)
        return value
    }

    put (key, value) {
        if (this.cache.has(key)) {
            this.cache.delete(key)
        } else if (this.capacity <= this.cache.size) {
            const firstkey = this.cache.keys().next().value
            this.cache.delete(firstkey)
            this._clearTimer(firstkey)
        } 
        this._resetTimer(key)
        this.cache.set(key, value)
    }

    _resetTimer (key) {
        if (this.timers.has(key)) {
            clearTimeout(this.timers.get(key))
        }
        const timer = setTimeout(() => {
            this.cache.delete(key)
            this.timers.delete(key)
        }, this.timeout * 1000)
        this.timers.set(key, timer)
    }

    _clearTimer (key) {
        if (this.timers.has(key)) {
            clearTimeout(this.timers.get(key))
            this.timers.delete(key)
        }
    }
}