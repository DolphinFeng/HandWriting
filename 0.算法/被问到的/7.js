// 实现一个函数，这个函数接收一个函数作为参数，并返回一个新的函数，这个新的函数只能执行一次，再次执行会返回上次的结果

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