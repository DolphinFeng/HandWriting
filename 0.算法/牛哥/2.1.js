let n = 153

/**
 * 判断一个数字是否为水仙花数
 * 水仙花数是指一个 n 位数，其各位数字的 n 次方之和等于该数本身
 * @param {number} n - 要判断的数字
 * @returns {boolean} - 如果是水仙花数返回 true，否则返回 false
 */
const isWaterFlower = (n) => {
    // 将数字转换为字符串
    let str = n.toString()
    // 获取数字的长度
    let len = str.length
    // 初始化总和为0
    let total = 0
    // 遍历每个数字字符
    for (let i = 0; i < len; i++) {
        // 将字符转换为数字并计算其 len 次方，然后累加到 total
        total += str[i]**len
    }
    // 判断累加结果是否等于原数字
    return total === n
}

// 输出结果，判断 153 是否为水仙花数
console.log(isWaterFlower(n));
