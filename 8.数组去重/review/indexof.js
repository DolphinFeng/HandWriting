let arr = [1, 1, 1, 2, 2]

function unique (arr) {
    let res = []
    for (let i = 0; i < arr.length; i++) {
        if (res.indexOf(arr[i]) === -1) {
            res.push(arr[i])
        }
    }
    return res
}

console.log(unique(arr));