let i = 0


function once (cb) {
    let ran = false, res
    return function () {
        if (ran) return res
        res = cb.apply(this, arguments)
        ran = true
        return res
    }
}

const add = once(() => {
    i++
    return i
})

console.log(add());
console.log(add());
