var arr = [1, [2, [3, [4, 5]]]]

function flatten (arr, n) {
    let res = []

    for (let item of arr) {
        if (item instanceof Array && n > 0) {
            res = res.concat(flatten(item, n - 1))
        } else {
            res.push(item)
        }
    }

    return res
}

console.log(flatten(arr, 1));