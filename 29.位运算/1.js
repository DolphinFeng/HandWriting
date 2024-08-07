/**
 * 该函数用于计算两个数的乘积，使用的是二进制位操作来实现。
 * @param {number} x - 第一个乘数
 * @param {number} y - 第二个乘数
 * @returns {number} - 返回两个数的乘积
 */
function multiply (x, y) {
    let result = 0; // 初始化结果为0
    while (y > 0) { // 当y大于0时继续循环
        if (y & 1) {  // 判断y二进制的最低位是否为1
            result += x; // 如果是1，则将x加到结果中
        }
        x = x << 1; // 将x左移一位，相当于x乘以2
        y = y >> 1; // 将y右移一位，相当于y除以2
    }
    return result; // 返回最终的乘积结果
}

console.log(multiply(5, 3)); // 输出乘积结果
