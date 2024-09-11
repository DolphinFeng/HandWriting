// 无重复子串的最长子串
s = "bb"

/**
 * 计算字符串中无重复字符的最长子串长度
 * @param {string} str - 输入的字符串
 * @returns {number} - 无重复字符的最长子串长度
 */
function maxLength(str) {
    // 如果字符串长度小于等于1，直接返回其长度
    if (str.length <= 1) return str.length
    // 初始化左右指针和最大长度
    let left = 0, right = 1, max = 0
    let temp
    // 遍历字符串
    while (right < str.length) {
        // 获取当前子串
        temp = str.slice(left, right)
        // 如果右指针指向的字符在当前子串中存在
        if (temp.indexOf(str[right]) > -1) {
            // 左指针右移一位
            left++
            continue
        } else {
            // 右指针右移一位
            right++
        }
        // 更新最大长度
        if (right - left > max) {
            max = right - left
        } 
    }
    return max
}

// 输出结果
console.log(maxLength(s)); // 3
