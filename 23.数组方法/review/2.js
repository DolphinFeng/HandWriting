Array.prototype.myMap = function (cb) {
    let arr = this
    let res = []
    for (let item of arr) {
        res.push(cb(item))
    }
    return res
}

let arr = [1, 2, 3, 4]

let res = arr.myMap(item => item + 1)

console.log(res);