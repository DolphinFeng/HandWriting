// 合并区间

arr = [[1,3],[2,6],[8,10],[15,18]]

function merge (arr) {
    let first = arr[0]
    let res = []
    for (let i = 1; i < arr.length; i++) {
        let cur = arr[i]
        if (first[1] >= cur[0]) {
            first[1] = Math.max(first[1], cur[1])
        } else {
            res.push(first)
            first = cur
        }
    }
    res.push(first)
    return res
}

console.log(merge(arr));