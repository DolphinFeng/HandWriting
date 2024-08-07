function add (...args) {
    return args.reduce((a, b) => a + b)
}

const sortFn = (...args) => {
    return args.sort()
}

const currying = (fn) => {
    const args = []
    const result = (...rest) => {
        if (rest.length) {
            return fn(...args)
        } else {
            args.push(...rest)
            return result
        }
    }
    return result
}

console.log(currying(add)(1)(2)(3)());
console.log(currying(add)(1, 2)(3, 4)(5)());
console.log(currying(add)(1)(2, 3, 4, 5)(6)());

console.log(currying(sortFn)(1)(3)(2)(0)());