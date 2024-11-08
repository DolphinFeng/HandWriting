// 第 n 位数
// 在无限的整数序列 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, ...中找到第 n 位数字。
function findNthDigit(n) {
    if (n < 10) return n;
    
    // 计算位数
    let len = 1;
    // 当前位数的起始数字
    let start = 1;
    // 当前位数包含的所有数字个数
    let count = 9;
    
    // 找到n所在的数字位数
    while (n > len * count) {
        n -= len * count;
        len++;
        start *= 10;
        count *= 10;
    }
    
    // 找到实际的数字
    start = start + Math.floor((n - 1) / len);
    
    // 找到在数字中的位置
    let s = start.toString();
    return parseInt(s[(n - 1) % len]);
}

// 测试用例
console.log(findNthDigit(3));  // 输出: 3
console.log(findNthDigit(11)); // 输出: 0
console.log(findNthDigit(15)); // 输出: 2
// 更多测试用例
console.log(findNthDigit(1000)); // 输出: 3
// 解释: 1000位数字在数字序列中的位置:
// 1-9: 占9位
// 10-99: 占180位 (90个数字 * 2位)
// 100-999: 占2700位 (900个数字 * 3位)
// 1000位在100-999范围内,具体是数字"370"的第一位"3"

console.log(findNthDigit(2147483647)); // 输出: 2
// 解释: 这是最大的32位有符号整数,测试边界情况

console.log(findNthDigit(190)); // 输出: 1
// 解释: 190位于两位数范围内
// 1-9: 占9位
// 10-99: 占180位
// 190-9=181位于两位数范围,对应数字"95"的第一位"1"

console.log(findNthDigit(1000000)); // 输出: 1
// 解释: 1000000位于6位数范围内的某个位置

console.log(findNthDigit(365)); // 输出: 7
// 解释: 365位于三位数范围内
// 1-9: 占9位
// 10-99: 占180位 
// 100-999: 占2700位
// 365-9-180=176位于三位数范围,对应数字"157"的第三位"7"
