let arr = [1, 1, 1, 2, 2]

function unique (arr) {
    let res = []
    let obj = {}
    for (let i = 0; i < arr.length; i++) {
        if (!obj[arr[i]]) {
            res.push(arr[i])
            obj[arr[i]] = 1
        } else {
            obj[arr[i]]++
        }
    }
    return res
}

console.log(unique(arr));