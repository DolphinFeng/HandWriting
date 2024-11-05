// 里面的对象x秒内没有被set或者get就会自动删除

class URLCache {
    constructor(capacity, timeout) {
        this.capacity = capacity;
        this.timeout = timeout; // 超时时间，单位为秒
        this.cache = new Map();
        this.timers = new Map(); // 存储每个键的定时器
    }

    get(key) {
        if (!this.cache.has(key)) return -1;
        const value = this.cache.get(key);
        this._resetTimer(key); // 重置定时器
        this.cache.delete(key);
        this.cache.set(key, value);
        return value;
    }

    put(key, value) {
        if (this.cache.has(key)) {
            this.cache.delete(key);
        } else if (this.capacity <= this.cache.size) {
            const firstKey = this.cache.keys().next().value;
            this._clearTimer(firstKey); // 清除定时器
            this.cache.delete(firstKey);
        }
        this.cache.set(key, value);
        this._resetTimer(key); // 设置新的定时器
    }

    _resetTimer(key) {
        if (this.timers.has(key)) {
            clearTimeout(this.timers.get(key)); // 清除旧的定时器
        }
        const timer = setTimeout(() => {
            this.cache.delete(key);
            this.timers.delete(key);
        }, this.timeout * 1000);
        this.timers.set(key, timer);
    }

    _clearTimer(key) {
        if (this.timers.has(key)) {
            clearTimeout(this.timers.get(key));
            this.timers.delete(key);
        }
    }
}

let cache = new URLCache(2, 5); // 容量为2，超时时间为5秒

cache.put(1, 1);
cache.put(2, 2);
console.log(cache.get(1)); // 输出: 1
setTimeout(() => {
    console.log(cache.get(2)); // 输出: -1 (因为超过5秒没有访问，已被删除)
}, 6000);
cache.put(3, 3);
console.log(cache.get(3)); // 输出: 3
cache.put(4, 4);
console.log(cache.get(1)); // 输出: -1 (因为容量限制，已被删除)
console.log(cache.get(3)); // 输出: 3
console.log(cache.get(4)); // 输出: 4