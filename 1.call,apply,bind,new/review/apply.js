Function.prototype.myApply = function (ctx) {
    if (typeof this !== 'function') {
        throw new TypeError('is not a function')
    }

    let res 
    let fn = Symbol()
    ctx[fn] = this
    if (arguments[1]) {
        res = ctx[fn](...arguments[1])
    } else {
        res = ctx[fn]
    }
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