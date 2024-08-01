function once (cb) {
    let ran = false, res
    return function () {
        if (ran) return res
        res = cb.apply(this, arguments)
        ran = true
        return res
    }
}

let i = 0

const foo = once(() => {
    i++
    return i
})

console.log(foo());
console.log(foo());