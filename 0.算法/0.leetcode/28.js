// 找字符串的第一个匹配项

let v1 = "sadbutsad"
let v2 = "sad"

/**
 * 在字符串 v1 中查找子字符串 v2 的第一个匹配项
 * @param {string} v1 - 主字符串
 * @param {string} v2 - 子字符串
 * @returns {number} - 子字符串在主字符串中的第一个匹配位置，如果未找到则返回 -1
 */
function strStr (v1, v2) {
    let len1 = v1.length, len2 = v2.length
    // 如果子字符串长度为0，返回-1
    if (len2 === 0) return -1
    // 遍历主字符串
    for (let i = 0; i < len1; i++) {
        // 如果当前字符与子字符串的第一个字符匹配
        if (v1[i] === v2[0]) {
            // 检查从当前位置开始的子字符串是否与v2相等
            if (v1.slice(i, i + len2) === v2) {
                return i // 返回匹配的起始位置
            }
        }
    }
    return -1 // 如果未找到匹配项，返回-1
}

console.log(strStr(v1, v2)); // 输出匹配项的起始位置
