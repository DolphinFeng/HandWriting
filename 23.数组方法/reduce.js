Array.prototype.myReduce = function (cb, init) {
    let array = this
    let acc = init || array[0] // pre
    let startIndex = init ? 0 : 1
    for (let i = startIndex; i < array.length; i++) {
        let cur = array[i]
        acc = cb(acc, cur, i, array)
    }
    return acc
}

let arr = [1, 2, 3, 4, 5]
let sum = arr.myReduce((a, b) => {
    return a + b
})

console.log(sum);