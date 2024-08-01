Function.prototype.myApply = function (ctx, args) {
    if (typeof this !== 'function') {
        throw new TypeError('myApply is not a function')
    }

    ctx = ctx || globalThis
    const fn = Symbol()
    ctx[fn] = this
    const res = args ? ctx[fn](...args) : ctx[fn]()
    delete ctx[fn]
    return res
}

function foo (a, b) {
    console.log(a, b);
    console.log(this.name);
}

let obj = {
    name: 'bar'
}

foo.myApply(obj, [1, 2])