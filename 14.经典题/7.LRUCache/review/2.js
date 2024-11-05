// 里面的对象x秒内没有被set或者get就会自动删除

class URLCache {
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

    set (key, value) {
        if (this.cache.has(key)) {
            this.cache.delete(key)
        } else if (this.capacity <= this.cache.size){
            const firstKey = this.cache.keys().next().value
            this.cache.delete(firstKey)
            this._clearTimer(firstKey)
        }
        this.cache.set(key, value)
        this._resetTimer(key)
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