var arr = [1, [2, [3, [4, 5]]]]

function flatten (arr, n) {
    let res = []
    
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] instanceof Array && n > 0) {
            res = res.concat(flatten(arr[i], n - 1))
        } else {
            res.push(arr[i])
        }
    }

    return res
}

console.log(flatten(arr, 1));
console.log(2);
