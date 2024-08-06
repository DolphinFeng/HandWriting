let arr = [1, 1, 1, 2, 2] // 初始化数组，包含重复元素

/**
 * 去重函数
 * @param {Array} arr - 需要去重的数组
 * @returns {Array} - 返回去重后的新数组
 */
function unique(arr) {
    let res = [] // 初始化结果数组
    for (let i = 0; i < arr.length; i++) { // 遍历输入数组
        if (res.indexOf(arr[i]) === -1) { // 如果结果数组中不存在当前元素
            res.push(arr[i]) // 将当前元素添加到结果数组中
        }
    }
    return res // 返回去重后的结果数组
}

console.log(unique(arr)); // 输出去重后的数组
