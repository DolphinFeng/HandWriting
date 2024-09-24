// 判断子序列

var isSubsequence = function(s, t) {
    if (s.length === 0) return true
    let i = 0
    while (i < t.length) {
        if (s[0] == t[i]) {
            const rest_s = s.substring(1)
            const rest_t = t.substring(i + 1)
            return isSubsequence(rest_s, rest_t)
        }
        i++
    } 
    return false
};

let s = "abc", t = "ahbgdc"
// let s = "axc", t = "ahbgdc"
console.log(isSubsequence(s, t)) 