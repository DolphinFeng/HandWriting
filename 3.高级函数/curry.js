// 给函数分步传递参数，每次传递参数，返回一个函数接受剩下的参数

function add (...args) {
    return args.reduce((a, b) => a + b)
}

const sortFn = (...args) => {
    return args.sort()
}

/**
 * 将一个函数进行柯里化处理，使其可以分步传递参数
 * @param {Function} fn - 需要柯里化的函数
 * @returns {Function} - 柯里化后的函数
 */
const currying = (fn) => {
    // 存储传递的参数
    const args = [];
    
    // 内部函数，用于接收参数并判断是否执行原函数
    const result = (...rest) => {
        // 如果没有传递参数，则执行原函数并返回结果
        if (rest.length === 0) {
            return fn(...args);
        } else {
            // 否则将参数存储起来，并返回自身以便继续接收参数
            args.push(...rest);
            return result;
        }
    };
    
    // 返回内部函数
    return result;
};



console.log(currying(add)(1)(2)(3)());
console.log(currying(add)(1, 2)(3, 4)(5)());
console.log(currying(add)(1)(2, 3, 4, 5)(6)());

console.log(currying(sortFn)(1)(3)(2)(0)());