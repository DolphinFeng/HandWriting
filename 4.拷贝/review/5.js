function copyFn (fn) {
    let str = fn.toString()
    return new Function(`return ${str}`).call(fn)
}

function foo () {
    console.log('fooooo');
}


let newFoo = copyFn(foo)
newFoo()