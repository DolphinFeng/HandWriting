// 删除后判断是否为回文
let str = 'abas'

/**
 * 判断字符串在删除一个字符后是否为回文
 * @param {string} s - 输入的字符串
 * @return {boolean} - 是否为回文
 */
const validPaliond = (s) => {
    let l = 0, r = s.length - 1
    while (l < r) {
        // 如果左右字符不相等，尝试删除左边或右边的字符后再判断
        if (s[l] !== s[r]) {
            return isPaliond(s, l + 1, r) || isPaliond(s, l, r - 1)
        }
        l++
        r--
    }
    return true
}

/**
 * 判断字符串是否为回文
 * @param {string} str - 输入的字符串
 * @param {number} i - 左指针
 * @param {number} j - 右指针
 * @return {boolean} - 是否为回文
 */
const isPaliond = (str, i, j) => {
    // 判断数组是否对称
    while (i < j) {
        if (str[i] !== str[j]) {
            return false
        }
        i++
        j--
    }
    return true
}

console.log(validPaliond(str));
