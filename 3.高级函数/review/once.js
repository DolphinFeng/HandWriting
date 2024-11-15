function once (fn) {
    let ran = false, res
    return function () {
        if (ran) return res
        res = fn.apply(this, arguments)
        ran = true
        return res
    }
}

let i = 0

const add = once(() => {
    i++
    return i
})

console.log(add());
console.log(add());

