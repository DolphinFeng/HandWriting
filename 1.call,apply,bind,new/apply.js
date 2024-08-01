Function.prototype.myApply = function (ctx) {
    if (typeof this !== 'function') {
        throw new TypeError('myApply is not a function')
    }
    let res 
    let fn = Symbol()
    ctx[fn] = this
    if (arguments[1]) { // 参数为数组
        res = ctx[fn](...arguments[1])
    } else { // 没传入参数
        res = ctx[fn]
    }
    delete ctx[fn]
    return res
}

function f(a, b) {
    console.log(a, b);
    console.log(this.name);
}

let obj = {
    name: '张三'
}

f.myApply(obj, [1, 2])