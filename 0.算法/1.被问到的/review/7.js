let i = 0

function once (fn) {
    let res, ran = false
    return function () {
        if (ran) return res
        res = fn.apply(this, arguments)
        ran = true
        return res
    }
}

let fn = once(() => {
    i++
    return i
})

console.log(fn()); // 1
console.log(fn()); // 1