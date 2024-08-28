class LRUCache {
    constructor (capacity) {
        this.capacity = capacity
        this.cache = new Map()
    }

    get (key) {
        if (!this.cache.has(key)) return -1
        const value = this.cache.get(key)
        this.cache.delete(key)
        this.cache.set(key, value)
        return key
    }

    put (key, value) {
        if (this.cache.has(key)) {
            this.cache.delete(key)
        } else if (this.cache.size >= this.capacity) {
            const firstKey = this.cache.keys().next().value
            this.cache.delete(firstKey)
        }
        this.cache.set(key, value)
    }
}

let cache = new LRUCache(2)

cache.put(1, 1)
cache.put(2, 2)

console.log(cache.get(1));

cache.put(3, 3)
console.log(cache.get(2));

cache.put(4, 4)
console.log(cache.get(1));
console.log(cache.get(3));
console.log(cache.get(4));


