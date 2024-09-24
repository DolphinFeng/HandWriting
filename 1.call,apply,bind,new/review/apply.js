function foo (...args) {
    console.log(...args);
    console.log(this.a);
}

let obj = {
    a: 111
}

// foo.apply(obj, [1, 2, 3])

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

foo.myApply(obj, [1, 2, 3])