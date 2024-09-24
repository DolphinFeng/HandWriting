var arr = [1, [2, [3, [4, 5]]]]

function flatten (arr) {
    return arr.reduce((pre, item) => {
        return pre.concat(item instanceof Array ? flatten(item) : item)
    }, [])
}

console.log(flatten(arr));