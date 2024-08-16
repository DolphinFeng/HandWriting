function foo () {
    return this.a
}

let b = 2

let obj = {
    a: 1
}

// console.log(b.call(obj));


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

console.log(b.myCall(obj));