Function.prototype.myCall = function(ctx) {
    if (typeof this !== 'function') { // 调用call的一定是函数
        throw new TypeError('myCall is not a function')
    }
    let args = Array.from(arguments).slice(1) // 第一个参数是对象，切割掉
    ctx.fn = this // this就是函数，往对象属性上挂函数声明，隐式绑定
    let res = ctx.fn(...args) // 参数需要还给函数本身
    delete ctx.fn // 防止foo也会有个返回值  删除之前添加到对象身上的函数，避免对对象造成影响
    return res
}

// 原理：判断类型、拿到参数、赋值函数、函数调用参数、删除函数、返回res

function foo() {
    return this.a
}

let obj = {
    a: 1
}

console.log(foo.myCall(obj));