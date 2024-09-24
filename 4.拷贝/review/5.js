function copyFn (fn) {
    let newFn = fn.toString(fn)
    return new Function(`return ${newFn}`).call(fn)
}

function foo () {
    console.log('fooooo');
}


let newFoo = copyFn(foo)
newFoo()