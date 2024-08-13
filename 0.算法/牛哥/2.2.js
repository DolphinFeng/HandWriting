// 找到三位数中所有的水仙花数

/**
 * 找到所有的 n 位数的水仙花数
 * @param {number} n - 数字的位数
 * @returns {number[]} - 返回所有的水仙花数数组
 */
const findAll = (n) => {
    let max = 10**n - 1 // 最大值
    let min = 10**(n - 1) // 最小值
    let arr = []
    for (let i = min; i < max; i++) {
        if (isWaterFlower(i)) { // 判断是否为水仙花数
            arr.push(i) // 如果是水仙花数，加入数组
        }
    }
    return arr
}

/**
 * 判断一个数字是否为水仙花数
 * @param {number} n - 要判断的数字
 * @returns {boolean} - 如果是水仙花数返回 true，否则返回 false
 */
const isWaterFlower = (n) => {
    let str = n.toString() // 将数字转换为字符串
    let len = str.length // 获取数字的长度
    let total = 0
    for (let i = 0; i < len; i++) {
        total += str[i]**len // 计算每个数字的 len 次方的和
    }
    return total === n // 判断和是否等于原数字
}

console.log(findAll(3)); // 输出所有的三位数水仙花数
