let arr = [3, 2, 4, 1, 5]

function quickSort(arr) {
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

let newArr = quickSort(arr)
console.log(newArr);