// 找字符串的第一个匹配项

let v1 = "sadbutsad"
let v2 = "ad"

function strStr (v1, v2) {
    let len1 = v1.length, len2 = v2.length
    for (let i = 0; i < len1; i++) {
        if (v1[i] === v2[0]) {
            if (v1.slice(i, i + len2) === v2) {
                return i
            }
        }
    }
}

console.log(strStr(v1, v2)); // 输出匹配项的起始位置