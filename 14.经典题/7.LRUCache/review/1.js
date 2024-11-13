class URLCache {
    constructor (capacity) {
        this.capacity = capacity
        this.cache = new Map()
    }

    get (key) {
        if (!this.cache.has(key)) return -1
        const value = this.cache.get(key)
        this.cache.delete(key)
        this.cache.set(key, value)
        return value
    }

    put (key, value) {
        if (this.cache.has(key)) {
            this.cache.delete(key)
        } else if (this.capacity <= this.cache.size) {
            const firstkey = this.cache.keys().next().value
            this.cache.delete(firstkey)
        }
        this.cache.set(key, value)
    }
}

let cache = new URLCache(2)

cache.put(1, 1)
cache.put(2, 2)
cache.put(3, 3)
console.log(cache.get(2));
cache.put(3, 4)
console.log(cache);