// 找到出现最多的元素
let lines = ['192.168.1.1', '192.168.1.2', '192.168.1.2', '192.168.1.2']

/**
 * 找到数组中出现次数最多的元素
 * @param {Array} arr - 输入的数组
 * @returns {String} - 出现次数最多的元素
 */
const findMost = (arr) => {
    const obj = {} // 用于记录每个元素出现的次数
    let max = 1 // 记录最大出现次数
    let ip = '' // 记录出现次数最多的元素

    for (let i = 0; i < lines.length; i++) {
        const item = arr[i]
        if (item in obj) {  // 判断对象是否已有该元素作为key
            obj[item]++ // 如果有，次数加1
            if (obj[item] > max) { // 如果当前元素出现次数大于最大次数
                max = obj[item] // 更新最大次数
                ip = item // 更新出现次数最多的元素
            }
        } else {
            obj[item] = 1 // 如果没有，将该元素加入对象并设为1
        }
    }
    return ip // 返回出现次数最多的元素
}

console.log(findMost(lines)); // 输出结果
