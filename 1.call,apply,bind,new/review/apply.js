function foo (a, b) {
    console.log(a, b);
    return this.name
}

let obj = {
    name: '张三'
}

console.log(foo.apply(obj, 1));

Function.prototype.myApply = function (ctx, args) {
    if (typeof this !== 'function') {
        throw new TypeError('this is not a function')
    }
    const fn = Symbol()
    ctx[fn] = this
    let res = args ? ctx[fn](...args) : ctx[fn]()
    delete ctx[fn]
    return res
}

// console.log(foo.myApply(obj, 1, 2));