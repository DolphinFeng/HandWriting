var arr = [1, [2, [3, [4, 5]]]]

function flatten (arr) {
    let res = []
    for (let item of arr) {
        if (item instanceof Array) {
            const nextArr = flatten(item)
            res = res.concat(nextArr)
        } else {
            res.push(item)
        }
    }
    return res
}

console.log(flatten(arr));
