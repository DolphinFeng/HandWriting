let arr1 = [1, 2, 4, 7] // 定义第一个有序数组
let arr2 = [3, 6, 9] // 定义第二个有序数组

/**
 * 合并两个有序数组并返回一个新的有序数组
 * @param {Array} arr1 - 第一个有序数组
 * @param {Array} arr2 - 第二个有序数组
 * @returns {Array} - 合并后的有序数组
 */
const merge = (arr1, arr2) => {
    let i = 0, j = 0 // 初始化两个指针，分别指向两个数组的起始位置
    let res = [] // 初始化结果数组

    // 当两个数组都未遍历完时，进行合并
    while (i < arr1.length && j < arr2.length) {
        if (arr1[i] < arr2[j]) { // 如果arr1当前元素小于arr2当前元素
            res.push(arr1[i]) // 将arr1当前元素添加到结果数组
            i++ // 移动arr1指针
        } else { // 如果arr2当前元素小于等于arr1当前元素
            res.push(arr2[j]) // 将arr2当前元素添加到结果数组
            j++ // 移动arr2指针
        }
    }

    // 如果arr1还有剩余元素，全部添加到结果数组
    while (i < arr1.length) {
        res.push(arr1[i])
        i++
    }

    // 如果arr2还有剩余元素，全部添加到结果数组
    while (j < arr2.length) {
        res.push(arr2[j])
        j++
    }

    return res // 返回合并后的有序数组
}

console.log(merge(arr1, arr2)); // 输出合并后的有序数组
