/**
 * once 函数用于创建一个只执行一次的函数。
 * @param {Function} cb - 需要被包装的函数
 * @returns {Function} - 返回一个新的函数，该函数只会执行一次
 */
function once (cb) {
    // 标记函数是否已经执行过
    let ran = false, res
    return function () {
        // 如果函数已经执行过，直接返回上次的结果
        if (ran) return res
        // 执行传入的函数并保存结果
        res = cb.apply(this, arguments)
        // 标记函数已经执行过
        ran = true
        // 返回结果
        return res
    }
}


let i = 0

const foo = once(() => {
    i++
    return i
})

console.log(foo());
console.log(foo());