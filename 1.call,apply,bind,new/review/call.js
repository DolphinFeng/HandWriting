function foo() {
    return this.a
}

let a = 2

console.log(foo());

// let obj = {
//     a: 1
// }

// console.log(foo.call(obj));

Function.prototype.myCall = function (ctx) {
    if (typeof this !== 'function') {
        throw new TypeError('not a function')
    }

    let args = [...arguments].slice(1)
    let fn = this
    ctx.fn = fn
    let res = ctx.fn(...args)
    delete ctx.fn
    return res
}

// console.log(foo.myCall(obj));