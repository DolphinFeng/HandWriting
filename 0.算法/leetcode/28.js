// 找字符串的第一个匹配项   李旭一面快手

let v1 = "sadbutsad"
let v2 = "sad"

function strStr (v1, v2) {
    let len1 = v1.length, len2 = v2.length
    if (len2 = 0) return -1
    for (let i = 0; i < len1; i++) {
        if (v1[i] === v2[0]) {
            if (v1.slice(i, i + len2) === v2) {
                return i
            }
        }
    }
    return -1
}

console.log(strStr(v1, v2));