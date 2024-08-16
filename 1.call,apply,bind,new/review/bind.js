function foo (a, b) {
    console.log(a, b);
    console.log(this.name);
    
}

let obj = {
    name: 'dolphin'
}

// let bar = foo.bind(obj, 1, 2)
// bar()

Function.prototype.myBind = function (ctx) {
    if (typeof this !== 'function') {
        throw new TypeError('this is not a function')
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

let bar = foo.myBind(obj, 1, 2)
bar()
