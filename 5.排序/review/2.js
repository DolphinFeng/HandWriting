let arr = [5, 1, 3, 4, 2]

function quickSort (arr) {
    let base = arr[0]
    let left = [], right = []
    let len = arr.length
    if (len <= 1) return arr
    for (let i = 1; i < len; i++) {
        if (arr[i] < base) {
            left.push(arr[i])
        } else {
            right.push(arr[i])
        }
    }
    return [...quickSort(left), base, ...quickSort(right)]
}

console.log(quickSort(arr));