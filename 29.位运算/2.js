/**
 * 该函数用于计算两个数的商，使用的是二进制位操作来实现。
 * @param {number} dividend - 被除数
 * @param {number} divisor - 除数
 * @returns {number} - 返回两个数的商
 */
function divide(dividend, divisor) {
    if (divisor === 0) {
        throw new Error("除数不能为0"); // 检查除数是否为0
    }

    let quotient = 0; // 初始化商为0
    let remainder = Math.abs(dividend); // 初始化余数为被除数的绝对值
    const absDivisor = Math.abs(divisor); // 取除数的绝对值

    while (remainder >= absDivisor) { // 当余数大于或等于除数时继续循环
        let tempDivisor = absDivisor;
        let multiple = 1;

        while (remainder >= (tempDivisor << 1)) { // 找到最大的倍数
            tempDivisor <<= 1; // 除数左移一位，相当于乘以2
            multiple <<= 1; // 倍数左移一位，相当于乘以2
        }

        remainder -= tempDivisor; // 减去当前倍数的除数
        quotient += multiple; // 将倍数加到商中
    }

    // 根据被除数和除数的符号确定商的符号
    return (dividend < 0) ^ (divisor < 0) ? -quotient : quotient;
}

console.log(divide(10, 3)); // 输出商
console.log(divide(7, -3)); // 输出商
