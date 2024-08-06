// reduce递归

var arr = [1, [2, [3, [4, 5]]]]

/**
 * 递归地将多维数组展平成一维数组
 * @param {Array} arr - 需要被展平的多维数组
 * @returns {Array} - 展平后的一维数组
 */
function flatten(arr) {
    // 使用 reduce 方法遍历数组
    return arr.reduce((pre, item) => {
        // 如果当前元素是数组，则递归调用 flatten 函数
        // 否则将当前元素直接连接到结果数组中
        return pre.concat(Array.isArray(item) ? flatten(item) : item)
    }, [])
}

console.log(flatten(arr)); // 输出展平后的数组
