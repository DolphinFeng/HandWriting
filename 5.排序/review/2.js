let arr = [5, 4, 7, 3, 2, 1]

function quickSort (arr) {
    let base = arr[0]
    let left = [], right = []
    if (arr.length <= 1) return arr
    for (let i = 1; i < arr.length; i++) {
        if (arr[i] < base) {
            left.push(arr[i])
        } else {
            right.push(arr[i])
        }
    }
    return [...quickSort(left), base, ...quickSort(right)]
}

console.log(quickSort(arr));
