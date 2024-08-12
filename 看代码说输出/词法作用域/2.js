// 这题目很有意思，唯一一个坑是从上到下执行，x 的值在 global 中会最终定值为 6
// 函数返回的是 this，this 指向的全局，再赋值给 x 和 y，因此 x.x 就是全局的 x 参数，输出都是 6

function a (xx) {
    this.x = xx
    return this
}

var x = a(5)
var y = a(6)

console.log(x.x);
console.log(y.x);