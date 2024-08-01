// 递归实现
var arr = [1, [2, [3, [4, 5]]]]

function flatten(arr) {
    let res = []
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] instanceof Array) {
            let nextArr = flatten(arr[i])
            res = res.concat(nextArr)
        } else {
            res.push(arr[i])
        }
    }
    return res
}

console.log(flatten(arr));