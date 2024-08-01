var arr = [1, [2, [3, [4, 5]]]]

function flatten (arr, n) {
    let res = []
    for (let i = 0; i < arr.length; i++) {
        if (Array.isArray(arr[i]) && n > 0) {
            let nextArr = flatten(arr[i], n - 1)
            res  = res.concat(nextArr)
        } else {
            res.push(arr[i])
        }
    }
    return res
}

console.log(flatten(arr, 3));