// 反转几位数，对称就可以靠栈来完成
// 例如：123 -> 321，900 -> 9
let n = 900

/**
 * 反转数字
 * @param {number} n - 需要反转的数字
 * @returns {number} - 反转后的数字
 */
const reverseNum = (n) => {
    // 将数字转换为字符串，再将字符串转换为数组，反转数组后再转换为字符串
    let arr = n.toString().split('').reverse().join('')
    // 将反转后的字符串转换为数字并返回
    return Number(arr)
}

// 输出反转后的数字
console.log(reverseNum(n));
