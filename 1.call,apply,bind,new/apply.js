/**
 * 自定义实现的 apply 方法，用于改变函数的 this 指向并执行函数
 * @param {Object} ctx - 函数执行时的上下文对象
 * @param {Array} args - 传递给函数的参数数组
 * @returns {*} 函数执行的结果
 */
Function.prototype.myApply = function (ctx, args) {
    // 检查调用 myApply 的是否为函数
    if (typeof this !== 'function') {
        throw new TypeError('myApply is not a function');
    }
    // 如果 ctx 为空，则默认指向全局对象
    ctx = ctx || globalThis;
    // 创建一个唯一的 Symbol 属性，防止属性冲突
    const fn = Symbol();
    // 将当前函数赋值给 ctx 上的 fn 属性
    ctx[fn] = this;
    // 如果有参数数组，则展开参数调用函数，否则直接调用
    const res = args ? ctx[fn](...args) : ctx[fn]();
    // 删除临时添加的 fn 属性
    delete ctx[fn];
    // 返回函数执行结果
    return res;
};


function f(a, b) {
    console.log(a, b);
    console.log(this.name);
}

let obj = {
    name: '张三'
}

f.myApply(obj, [1, 2])


