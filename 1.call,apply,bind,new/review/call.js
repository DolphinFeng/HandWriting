function foo (...args) {
    console.log(args);
    
    return this.a
}

let b = 1

let obj = {
    a: 1
}

// console.log(b.call(obj));

Function.prototype.myCall = function (ctx, ...args) {
    if (typeof this !== 'function') {
        throw new TypeError('is not a function')
    }

    ctx.fn = this
    let res = ctx.fn(...args)
    delete ctx.fn
    return res
}

console.log(foo.myCall(obj, 1, 1));
