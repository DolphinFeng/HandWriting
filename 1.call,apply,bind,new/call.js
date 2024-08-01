/**
 * 自定义实现的 call 方法，用于改变函数的 this 指向并执行该函数
 * @param {Object} ctx - 要绑定的 this 对象
 * @param {...*} args - 传递给函数的参数
 * @returns {*} 函数执行的返回值
 */
Function.prototype.myCall = function(ctx) {
    // 确保调用 myCall 的是一个函数
    if (typeof this !== 'function') {
        throw new TypeError('myCall is not a function');
    }
    
    // 获取传递的参数，去掉第一个参数（ctx）
    let args = Array.from(arguments).slice(1);
    
    // 将当前函数（this）作为 ctx 的一个属性进行绑定
    ctx.fn = this;
    
    // 执行函数并传递参数
    let res = ctx.fn(...args);
    
    // 删除临时添加的属性，避免对 ctx 对象造成影响
    delete ctx.fn;
    
    // 返回函数执行的结果
    return res;
}

// 原理：判断类型、拿到参数、赋值函数、函数调用参数、删除函数、返回res

function foo() {
    return this.a
}

let obj = {
    a: 1
}

console.log(foo.myCall(obj));