function foo (...args) {
    console.log(args);
    return this.a
}

let obj = {
    a: 111
}

Function.prototype.myApply = function (ctx, args) {
    if (typeof this !== 'function') {
        throw new TypeError('not a function')
    }

    let fn = Symbol()
    ctx[fn] = this
    let res = args ? ctx[fn](...args) : ctx[fn]()
    delete ctx[fn]
    return res
}

console.log(foo.myApply(obj, [1, 32]));
