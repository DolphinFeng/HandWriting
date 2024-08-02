let arr = [3, 2, 4, 1, 5]

/**
 * 快速排序函数
 * @param {Array} arr - 需要排序的数组
 * @returns {Array} - 排序后的数组
 */
function quickSort(arr) {
    // 选择数组的第一个元素作为基准
    let base = arr[0]
    // 定义两个数组，分别存放比基准小和比基准大的元素
    let left = [], right = []
    // 获取数组长度
    let len = arr.length
    // 如果数组长度小于等于1，直接返回数组
    if (len <= 1) return arr
    // 遍历数组，将元素按大小分配到left和right数组中
    for (let i = 1; i < len; i++) {
        if (arr[i] < base) {
            left.push(arr[i])
        } else {
            right.push(arr[i])
        }
    }
    // 递归调用quickSort函数，对left和right数组进行排序，并合并结果
    return [...quickSort(left), base, ...quickSort(right)]
}


let newArr = quickSort(arr)
console.log(newArr);