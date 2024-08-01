function memoize(fn) {
    const cache = new Map();
    return function () {
        const key = JSON.stringify(arguments);
        if (cache.has(key)) {
            return cache.get(key);
        }
        const res = fn.apply(this, arguments);
        cache.set(key, res);
        return res;
    };
}
