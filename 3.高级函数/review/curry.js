function add (...args) {
    return args.reduce((a, b) => a + b)
}

function sortFn (...args) {
    return args.sort()
}

const currying = (fn) => {
    const args = []

    const res = (...rest) => {
        if (rest.length === 0) {
            return fn(...args)
        } else {
            args.push(...rest)
            return res
        }
    }

    return res
}

console.log(currying(add)(1)(2)(3)());
console.log(currying(add)(1, 2)(3, 4)(5)());
console.log(currying(add)(1)(2, 3, 4, 5)(6)());

console.log(currying(sortFn)(1)(3)(2)(0)());