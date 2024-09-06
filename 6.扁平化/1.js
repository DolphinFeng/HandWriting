// 递归实现数组扁平化
var arr = [1, [2, [3, [4, 5]]]]

/**
 * 扁平化数组
 * @param {Array} arr - 需要扁平化的数组
 * @returns {Array} - 扁平化后的数组
 */
function flatten(arr) {
    let res = [] // 初始化结果数组
    for (let i = 0; i < arr.length; i++) { // 遍历数组的每个元素
        if (arr[i] instanceof Array) { // 如果元素是数组
            let nextArr = flatten(arr[i]) // 递归调用flatten函数
            res = res.concat(nextArr) // 将递归结果合并到结果数组中
        } else {
            res.push(arr[i]) // 如果元素不是数组，直接添加到结果数组中
        }
    }
    return res // 返回扁平化后的数组
}

console.log(flatten(arr)); // 输出扁平化后的数组