let arr = [5, 1, 3, 6, 2, 4, 7]

function mergeSort (arr) {
    if (arr.length <= 1) return arr
    let len = arr.length
    let mid = Math.floor(len / 2)
    let left = arr.slice(0, mid)
    let right = arr.slice(mid)
    
    function merge (left, right) {
        let res = [], i = 0, j = 0
        while (i < left.length && j < right.length) {
            if (left[i] < right[j]) {
                res.push(left[i])
                i++
            } else {
                res.push(right[j])
                j++
            }
        }
        while (i < left.length) {
            res.push(left[i])
            i++
        }
        while (j < right.length) {
            res.push(right[j])
            j++
        }
        return res
    }

    return merge(mergeSort(left), mergeSort(right))
}

// 输出排序后的数组
console.log(mergeSort(arr));
