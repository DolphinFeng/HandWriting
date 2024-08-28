// 12345678  ->  一千二百三十四万五千六百七十八
let num = 12345678

function numberToChinese (num) {
    const units = ['', '十', '百', '千', '万', '十', '百', '千', '亿']
    const chars = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九']

    let res = ''
    let numStr = num.toString()
    let len = numStr.length

    for (let i = 0; i < len; i++) {
        if (numStr[i] !== 0) {
            res += chars[numStr[i]] + units[len - i - 1]
        } else {
            if (res[res.length - 1] !== '零') {
                res += chars[i]
            }
        }
    }

    return res
}


console.log(numberToChinese(12345678)); // 一千二百三十四万五千六百七十八