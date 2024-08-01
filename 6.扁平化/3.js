// reduce递归

var arr = [1, [2, [3, [4, 5]]]]

function flatten(arr) {
    return arr.reduce((pre, item) => {
        return pre.concat(Array.isArray(item) ? flatten(item) : item)
    }, [])
}

console.log(flatten(arr));
