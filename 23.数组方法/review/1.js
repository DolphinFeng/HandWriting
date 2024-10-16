Array.prototype.myReduce = function (fn, init) {
    let arr = this
    let acc = init || arr[0]
    let startIndex = init ? 0 : 1
    for (let i = startIndex; i < arr.length; i++) {
        let cur = arr[i]
        acc = fn(acc, cur, i, arr)
    }
    return acc
}
let arr = [1, 2, 3, 4, 5]

let sum = arr.myReduce((a, b) => a + b)

console.log(sum);