function foo () {
    console.log(this.a);
}

let obj = {
    a: 1
}

// foo.call(obj)

Function.prototype.myCall = function (ctx, ...args) {
    if (typeof this !== 'function') {
        throw new TypeError('not a function')
    }

    ctx.fn = this
    let res = ctx.fn(...args)
    delete ctx.fn
    return res
}

foo.myCall(obj)