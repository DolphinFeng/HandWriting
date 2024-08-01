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

function person (name, age) {
    console.log(name);
    console.log(age);
    console.log(this);
}

let obj = {
    name: 'dolphin',
    age: 18
}

let foo = person.myBind(obj, 'cc')

foo(12)