// 无重复子串的最长子串
s = "abcdabcdbb"

function maxLength(str) {
    // 长度为1返回1
    if (str.length <= 1) return str.length
    // 左右指针
    let left = 0, right = 1, max = 0
    let temp
    while (right < str.length) {
        temp = str.slice(left, right)
        if (temp.indexOf(str[right]) > -1) { // 右侧存在
            left++
            continue
        } else { // 右侧不存在
            right++
        }
        if (right - left > max) {
            max = right - left
        } 
    }
    return max
}

console.log(maxLength(s)); // 3