function foo () {
    return this.a
}

let obj = {
    a: 1
}

Function.prototype.myCall = function (ctx) {
    if (typeof this !== 'function') {
        throw new TypeError('this is not a function')
    }

    let args = [...arguments].slice(1)
    ctx.fn = this
    let res = ctx.fn(...args)
    delete ctx.fn
    return res
}

console.log(foo.myCall(obj));