function foo () {
    console.log('fooooo');
}

function copyFn (fn) {
    let str = fn.toString()
    return new Function(`return ${fn}`).call(fn)
}

let newFoo = copyFn(foo)
newFoo()