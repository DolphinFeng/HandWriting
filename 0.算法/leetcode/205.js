// 同构字符串

let s = "paper", t = "title"

/**
 * 判断两个字符串是否是同构字符串
 * @param {string} s - 第一个字符串
 * @param {string} t - 第二个字符串
 * @returns {boolean} - 如果两个字符串是同构的，返回 true；否则返回 false
 */
function same (s, t) {
    // 遍历字符串 s 的每一个字符
    for (let i = 0; i < s.length; i++) {
        // 比较 s 和 t 中相同位置字符的首次出现位置
        if (s.indexOf(s[i]) !== t.indexOf(t[i])) return false 
    }
    // 如果所有字符的首次出现位置都相同，则返回 true
    return true
}

// 输出结果，判断字符串 s 和 t 是否是同构字符串
console.log(same(s, t));
