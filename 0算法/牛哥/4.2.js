// 删除后判断是否为回文
let str = 'abas'

const validPaliond = (s) => {
    let l = 0, r = s.length - 1
    while (l < r) {
        if (s[l] !== s[r]) {
            return isPaliond(s, l + 1, r) || isPaliond(s, l, r - 1)
        }
        l++
        r--
    }
}

const isPaliond = (str, i, j) => {
    // 判断数组是否对称

    let i = 0, j = str.length - 1
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