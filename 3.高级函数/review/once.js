function once (fn) {
    let ran = false, res
    return function () {
        if (ran) return res 
        ran = true
        res = fn.apply(this, arguments)
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