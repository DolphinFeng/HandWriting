// 12345678  ->  一千二百三十四万五千六百七十八
let num = 12345678

/**
 * 将数字转换为中文表示法
 * @param {number} num - 要转换的数字
 * @returns {string} - 转换后的中文字符串
 */
function numberToChinese(num) {
    // 定义中文单位
    const units = ['', '十', '百', '千', '万', '十', '百', '千', '亿'];
    // 定义中文数字字符
    const chars = '零一二三四五六七八九';
    let result = '';
    // 将数字转换为字符串
    let numStr = num.toString();
    let len = numStr.length;

    // 遍历数字字符串的每一位
    for (let i = 0; i < len; i++) {
        let n = numStr[i];
        // 如果当前数字不是0，则添加对应的中文字符和单位
        if (n !== '0') {
            result += chars[n] + units[len - i - 1];
        } else {
            // 如果当前数字是0，且结果字符串最后一个字符不是零，则添加一个零
            if (result[result.length - 1] !== '零') {
                result += chars[n];
            }
        }
    }

    // 处理连续的零
    result = result.replace(/零+/g, '零');
    // 去掉末尾的零
    result = result.replace(/零$/, '');
    // 处理 "一十" 的情况
    result = result.replace(/^一十/, '十');

    return result;
}


console.log(numberToChinese(12345678)); // 一千二百三十四万五千六百七十八
console.log(numberToChinese(120456708));