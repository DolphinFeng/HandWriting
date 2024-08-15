// 同构字符串


let s = "paper", t = "title"

function same (s, t) {
    for (let i = 0; i < s.length; i++) {
        if (s.indexOf(s[i]) !== t.indexOf(t[i])) return false
    }
    return true
}

console.log(same(s, t));
