// 定义一个数组，包含一些重复的元素
let arr = [1, 1, 1, 2, 2]

/**
 * 该函数用于去除数组中的重复元素
 * @param {Array} arr - 需要去重的数组
 * @returns {Array} - 返回一个新的数组，包含唯一的元素
 */
function unique(arr) {
    // 使用 Set 数据结构去重，并将结果转换为数组返回
    return Array.from(new Set(arr))
}

// 输出去重后的数组
console.log(unique(arr));
