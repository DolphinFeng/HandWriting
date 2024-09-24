function foo (...args) {
    console.log(...args);
    console.log(this.a);
}

let obj = {
    a: 111
}



Function.prototype.myBind = function (ctx) {
    if (typeof this !== 'function') {
        throw new TypeError('myBind is not a function')
    }
    
    let args = [...arguments].slice(1)
    
    let fn = this
    
    let Fn = function () {
        return fn.apply(
            this instanceof Fn ? this : ctx,
            args.concat(...arguments)
        )
    }
    
    Fn.prototype = Object.create(fn.prototype)
    
    return Fn
}

let bar = foo.myBind(obj, [1, 2, 3])
bar()