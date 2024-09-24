/**
 * 自定义的 bind 方法，用于绑定函数的上下文和参数
 * @param {Object} ctx - 需要绑定的上下文对象
 * @returns {Function} - 绑定了上下文和参数的新函数
 */
Function.prototype.myBind = function(ctx) {
    // 检查调用 myBind 的是否是一个函数
    if (typeof this !== 'function') {
        throw new TypeError('myBind is not a function')
    }
    
    // 获取传入的参数，去掉第一个 ctx 参数
    let args = [...arguments].slice(1)
    
    // 保存当前函数的引用
    let fn = this
    
    // 定义一个新的函数，用于返回绑定后的函数
    let Fn = function () {
        // 判断当前函数是否作为构造函数调用
        // 如果是，则使用新创建的对象作为上下文，否则使用传入的 ctx 作为上下文
        return fn.apply(
            this instanceof Fn ? this : ctx,
            args.concat(...arguments)
        )
    }
    
    // 设置新函数的原型为原函数的原型
    Fn.prototype = Object.create(fn.prototype)
    
    // 返回新函数
    return Fn
}


function person (name, age, ...args) {
    console.log(name);
    console.log(age);
    console.log(...args);
    console.log(this);
}

let obj = {
    name: 'dolphin',
    age: 18
}

let foo = person.myBind(obj, 'cc', [1, 2, 3])

foo(12)