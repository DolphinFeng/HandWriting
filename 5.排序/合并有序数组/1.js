// 合并有序数组
let arr1 = [1, 2, 4, 7]
let arr2 = [3, 6, 9]

/**
 * 合并两个有序数组
 * @param {number[]} arr1 - 第一个有序数组
 * @param {number[]} arr2 - 第二个有序数组
 * @returns {number[]} - 合并后的有序数组
 */
const merge = (arr1, arr2) => {
    let i = 0, j = 0
    let res = []
    // 当两个数组都没有遍历完时，进行比较并合并
    while (i < arr1.length && j < arr2.length) {
        if (arr1[i] < arr2[j]) {
            res.push(arr1[i]) // 将较小的元素加入结果数组
            i++
        } else {
            res.push(arr2[j]) // 将较小的元素加入结果数组
            j++
        }
    }
    // 如果arr1还有剩余元素，全部加入结果数组
    while (i < arr1.length) {
        res.push(arr1[i])
        i++
    }
    // 如果arr2还有剩余元素，全部加入结果数组
    while (j < arr2.length) {
        res.push(arr2[j])
        j++
    }
    return res
}

console.log(merge(arr1, arr2)); // 输出合并后的有序数组
