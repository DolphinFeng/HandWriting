function memoize (fn) {
    const cache = new Map()
    return function (...args) {
        const key = JSON.stringify(args)
        if (cache.has(key)) {
            return cache.get(key)
        }
        const result = fn.apply(this, args)
        cache.set(key, result)
        return result
    }
}

function fibonacci (n) {
    if (n <= 1) return n
    return fibonacci(n - 1) + fibonacci(n - 2)
}

const memoizedFibonacci = memoize(fibonacci)

console.time('正常执行')
console.log(fibonacci(35));
console.timeEnd('正常执行')

console.time('开始记忆')
console.log(memoizedFibonacci(35));
console.timeEnd('开始记忆')

console.time('记忆后 35')
console.log(memoizedFibonacci(35));
console.timeEnd('记忆后 35')

console.time('记忆后 36')
console.log(memoizedFibonacci(36));
console.timeEnd('记忆后 36')