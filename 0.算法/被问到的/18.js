// 12345678  ->  一千二百三十四万五千六百七十八
let num = 12345678

function numberToChinese (num) {
    let str = num.toString()
    let obj = {
        '0': '零',
        '1': '一',
        '2': '二',
        '3': '三',
        '4': '四',
        '5': '五',
        '6': '六',
        '7': '七',
        '8': '八',
        '9': '九'
    }

    let units = ['', '十', '百', '千']
    let bigUnits = ['', '万', '亿']

    
}

numberToChinese(num)