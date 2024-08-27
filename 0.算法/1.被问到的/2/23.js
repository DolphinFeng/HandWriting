/**
 * 反转整数
 * @param {number} x - 要反转的整数
 * @return {number} - 反转后的整数，如果超出32位有符号整数范围则返回0
 */
var reverse = function(x) {
    // 辅助函数：检查数字是否在32位有符号整数范围内
    function check(num) {
        const MIN = -(2 ** 31); // 32位有符号整数的最小值
        const MAX = (2 ** 31) - 1; // 32位有符号整数的最大值
        return (num < MIN || num > MAX) ? 0 : num; // 如果超出范围则返回0，否则返回原数
    }

    // 将数字转换为字符串，反转字符串，再转换回数字
    const reversedStr = Math.abs(x).toString().split('').reverse().join('');
    const reversedNum = parseInt(reversedStr) * Math.sign(x); // 乘以原数字的符号以保留正负号

    return check(reversedNum); // 检查反转后的数字是否在范围内
};

console.log(reverse(120)); // 输出反转后的结果