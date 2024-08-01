const fn = (s, t) => {
    if (s.length !== t.length) return false
    let obj1 = {}, res1 = []
    let obj2 = {}, res2 = []
    for (let i = 0; i < s.length; i++) {
        if (!obj1[s[i]]) {
            res1.push(i)
            obj1[s[i]] = s[i]
        }
        
    }
    for (let j = 0; j < t.length; j++) {
        if (!obj2[t[j]]) {
            res2.push(j)
            obj2[t[j]] = t[j]
        }
    }
    return res1.join('') === res2.join('')
}

console.log(fn('paper','title'))