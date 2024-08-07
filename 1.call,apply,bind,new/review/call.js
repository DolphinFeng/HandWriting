function foo () {
    return this.a
}

let obj = {
    a: 1
}

Function.prototype.myCall = function (ctx, args) {
    if (typeof this !== 'function') {
        throw new TypeError('myCall in not a function') 
    }

    ctx.fn = this
    let res = ctx.fn(args)
    delete ctx.fn
    return res
}

console.log(foo.myCall(obj));