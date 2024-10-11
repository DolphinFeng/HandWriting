let arr = [5, 4, 7, 3, 2, 1]

function quickSort (arr) {
    let left = [], right = [], base = arr[0]
    if (arr.length <= 1) return arr
    for (let i = 1; i < arr.length; i++) {
        if (base < arr[i]) {
            left.push(arr[i])
        } else {
            right.push(arr[j])
        }
    }
    return [...quickSort(left), base, ...quickSort(right)]
}

console.log(quickSort(arr));
