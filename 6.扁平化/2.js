// 扁平n维
var arr = [1, [2, [3, [4, 5]]]]

/**
 * 扁平化数组到指定的深度
 * @param {Array} arr - 需要扁平化的数组
 * @param {number} n - 扁平化的深度
 * @returns {Array} - 扁平化后的数组
 */
const flatten = (arr, n) => {
    let res = [] // 初始化结果数组
    for (let i = 0; i < arr.length; i++) {
        // 如果当前元素是数组且深度n大于0
        if (Array.isArray(arr[i]) && n > 0) {
            // 递归调用flatten函数，深度减1
            let nextArr = flatten(arr[i], n - 1)
            // 将递归结果合并到结果数组中
            res = res.concat(nextArr)
        } else {
            // 如果不是数组或深度为0，直接将元素添加到结果数组中
            res.push(arr[i])
        }
    }
    return res // 返回扁平化后的数组
}

console.log(flatten(arr, 1)); // 输出扁平化深度为1的数组
