// 拷贝函数

/**
 * 复制一个函数
 * @param {Function} fn - 需要复制的函数
 * @returns {Function} - 复制后的新函数
 */
function copyFn (fn) {
    // 将函数转换为字符串
    let str = fn.toString()
    // 使用 Function 构造函数创建一个新的函数
    return new Function(`return ${str}`).call(fn)
}

function foo () {
    console.log('foooooo');
}

let newFn = copyFn(foo)
newFn()