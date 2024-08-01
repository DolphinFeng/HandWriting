// 实现一个函数，这个函数接收一个函数作为参数，并返回一个新的函数，这个新的函数只能执行一次，再次执行会返回上次的结果

function once(func) {}

let i = 0
const foo = once(() => {
    i++
    return i
}, times)

console.log(foo()); // i = 1
console.log(foo()); // i = 1