let arr = [3, 2, 4, 1, 5]

function bubbleSort (arr) {
    let len = arr.length
    for (let i = 0; i < len; i++) {
        for (let j = i + 1; j < len; j++) {
            if (arr[i] > arr[j]) {
                [arr[i], arr[j]] = [arr[j], arr[i]]
            }
        }
    }
}

bubbleSort(arr)
console.log(arr);