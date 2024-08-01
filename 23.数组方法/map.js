// 手写map

Array.prototype.myMap = function(cb){
    let res = []
    let arr = this
    for(let item of arr){
        res.push(cb(item))
    }
    return res
}

let arr = [1, 2, 3, 4]

let newArr = arr.myMap((item) => item + 1)

console.log(newArr);