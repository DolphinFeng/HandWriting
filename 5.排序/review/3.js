let arr = [5, 3, 2, 4, 1]
// 1, 3, 2, 4, 5
// 1, 2, 3, 4, 5


function selectSort (arr) {
    let minIndex
    let len = arr.length
    for (let i = 0; i < arr.length; i++) {
        minIndex = i
        for (let j = i; j < arr.length; j++) {
            if (arr[j] < arr[minIndex]) {
                minIndex = j
            }
        }
        if (minIndex !== i) {
            [arr[i], arr[minIndex]] = [arr[minIndex], arr[i]]
        }
    }
    return arr
}

// 输出排序后的数组
console.log(selectSort(arr));
