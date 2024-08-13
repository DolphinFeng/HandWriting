/**
 * 将数字转换为带千分位逗号的字符串
 * @param {number} n - 需要转换的数字
 * @returns {string} - 带千分位逗号的字符串
 */
function getThousandSign(n) {
    // 将数字转换为字符串
    let str = n.toString()
    // 存储分割后的字符串块
    const res = []
    // 获取字符串长度
    let len = str.length
    // 从字符串末尾每三位进行分割
    for (let i = len; i > 0; i -= 3) {
        // 获取当前块的子字符串
        let block = str.substring(i - 3, i)
        // 将块插入结果数组的开头
        res.unshift(block)
    }
    // 将数组用逗号连接成字符串并返回
    return res.join(',')
}

// 测试函数，输出带千分位逗号的字符串
console.log(getThousandSign(10000))

// 考虑小数
// function getThousandSign(num) {
//     let str = num.toString().split('.')[0]
//     let res = []
//     let len = str.length
//     for (let i = len; i > 0; i -= 3) {
//         let block = str.substring(i - 3, i)
//         res.unshift(block)
//     }
//     return res.join(',') + '.' + num.toString().split('.')[1]
// }