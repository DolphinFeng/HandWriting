// 12345678  ->  一千二百三十四万五千六百七十八
let num = 12345678

/**
 * 将数字转换为中文表示法
 * @param {number} num - 要转换的数字
 * @returns {string} - 转换后的中文字符串
 */
function numberToChinese(num) {
    const units = ['', '十', '百', '千', '万', '十', '百', '千', '亿'];
    const chars = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];

    let result = '';
    let numStr = num.toString();
    let len = numStr.length;
    let zeroFlag = false; // 用于标记是否需要添加“零”

    for (let i = 0; i < len; i++) {
        let n = numStr[i];
        if (n !== '0') {
            if (zeroFlag) {
                result += chars[0]; // 添加“零”
                zeroFlag = false;
            }
            result += chars[n] + units[len - i - 1];
        } else {
            zeroFlag = true;
        }
    }

    // 处理连续的零
    let finalResult = '';
    for (let i = 0; i < result.length; i++) {
        if (!(result[i] === '零' && result[i + 1] === '零')) {
            finalResult += result[i];
        }
    }

    // 去掉末尾的零
    if (finalResult[finalResult.length - 1] === '零') {
        finalResult = finalResult.slice(0, -1);
    }

    // 处理 "一十" 的情况
    if (finalResult.startsWith('一十')) {
        finalResult = finalResult.slice(1);
    }

    return finalResult;
}

console.log(numberToChinese(12345678)); // 一千二百三十四万五千六百七十八
console.log(numberToChinese(120456708)); // 一亿二千零四十五万六千七百零八