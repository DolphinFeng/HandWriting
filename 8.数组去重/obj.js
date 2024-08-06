let arr = [1, 1, 1, 2, 2] // 初始化数组

/**
 * 去除数组中的重复元素
 * @param {Array} arr - 输入的数组
 * @returns {Array} - 返回去重后的数组
 */
function unique (arr) {
    let res = [] // 存储去重后的结果数组
    let obj = {} // 用于记录数组中元素出现的次数
    for (let i = 0; i < arr.length; i++) { // 遍历输入数组
        if (!obj[arr[i]]) { // 如果元素在obj中不存在
            res.push(arr[i]) // 将元素添加到结果数组中
            obj[arr[i]] = 1 // 在obj中记录该元素
        } else {
            obj[arr[i]]++ // 如果元素已存在，增加其计数
        }
    }
    return res // 返回去重后的结果数组
}

console.log(unique(arr)); // 输出去重后的数组
