// 字符串首个不重复字符

var firstUniqChar = function(s) {
    let map = new Map()
    // 遍历字符串，将每个字符出现的次数存入map
    for (let i = 0; i < s.length; i++) {
        let cur = s[i]
        let val = map.get(cur)
        if (map.has(cur)) {
            map.set(cur, val + 1)
        } else {
            map.set(cur, 1)
        }
    }
    // 遍历字符串，返回第一个出现次数为1的字符的索引
    for (let i = 0; i < s.length; i++) {
        if (map.get(s[i]) == 1) {
            return i
        }
    }
    return -1
};

console.log(firstUniqChar('leetcode')); // 0
console.log(firstUniqChar('loveleetcode')); // 2