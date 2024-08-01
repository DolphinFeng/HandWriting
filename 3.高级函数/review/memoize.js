function memoize (fn) {
    let cache = new Map()
    return function () {
        let key = JSON.stringify(arguments)
        if (cache.has(key)) {
            return cache.get(key)
        }
        let res = fn.apply(this, arguments)
        cache.set(key, res)
        return res
    }
}