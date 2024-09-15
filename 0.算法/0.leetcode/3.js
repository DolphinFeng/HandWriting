// 无重复子串的最长子串
s = "bbabc"

function maxLength(str) {
    if (str.length <= 1) return str.length
    let left = 0, right = 1, max = 0
    let temp

    while (right < str.length) {
        temp = str.slice(left, right)
        if (temp.indexOf(str[right]) > -1) {
            left++
            continue
        } else {
            right++
        }
        if (right - left > max) {
            max = right - left
        } 
    }
    return max
}

console.log(maxLength(s));
