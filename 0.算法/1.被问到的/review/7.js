let i = 0

function once (fn) {
    let ran = false, res
    return function () {
        if (ran) return res
        res = fn.apply(this, arguments)
        ran = true
        return res
    }
}

const foo = once(() => {
    i++
    return i
})

console.log(foo());
console.log(foo());