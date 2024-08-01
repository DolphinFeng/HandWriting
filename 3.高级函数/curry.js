// 给函数分步传递参数，每次传递参数，返回一个函数接受剩下的参数

function add (...args) {
    return args.reduce((a, b) => a + b)
}

const sortFn = (...args) => {
    return args.sort()
}

const currying = function (fn) {
    const args = []
    return function result(...rest) {
        if (rest.length === 0) { // 最后不接受参数才是调用
            return fn(...args)
        } else {
            args.push(...rest)
            return result
        }
    }
}

console.log(currying(add)(1)(2)(3)());
console.log(currying(add)(1, 2)(3, 4)(5)());
console.log(currying(add)(1)(2, 3, 4, 5)(6)());

console.log(currying(sortFn)(1)(3)(2)(0)());