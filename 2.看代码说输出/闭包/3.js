function fn(n) {
    n = 0
    return function fn1(n) {
        n += 1
        return fn(n)
    }
}

const result = fn(5)(10);