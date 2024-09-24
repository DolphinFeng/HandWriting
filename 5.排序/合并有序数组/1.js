// 合并有序数组
let arr1 = [1, 2, 4, 7]
let arr2 = [3, 6, 9]

/**
 * 合并两个有序数组
 * @param {number[]} arr1 - 第一个有序数组
 * @param {number[]} arr2 - 第二个有序数组
 * @returns {number[]} - 合并后的有序数组
 */
function merge (arr1, arr2) {
    let i = 0, j = 0, res = []
    
    while (i < arr1.length && j < arr2.length) {
        if (arr1[i] < arr2[j]) res.push(arr1[i++])
        else res.push(arr2[j++])
    }

    while (i < arr1.length) {
        res.push(arr1[i++])
    }
    while (j < arr2.length) {
        res.push(arr2[j++])
    }
    
    return res
}

console.log(merge(arr1, arr2)); // 输出合并后的有序数组
