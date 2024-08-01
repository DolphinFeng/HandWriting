// 拷贝函数

function foo () {
    console.log('foooooo');
}

function copyFn (fn) {
    let str = fn.toString()
    return new Function(`return ${foo}`).call(fn)
}

let newFn = copyFn(foo)
newFn()