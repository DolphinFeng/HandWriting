Array.prototype.myMap = function (cb) {
    let arr = this
    let res = []
    for (let i = 0; i < arr.length; i++) {
        res.push(cb(arr[i], i, arr))
    }
    return res
}
let arr = [1, 2, 3, 4]

let res = arr.myMap(item => item + 1)

console.log(res);