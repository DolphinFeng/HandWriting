/**
 * 计算斐波那契数列的第 n 项
 * @param {number} n - 需要计算的斐波那契数列的项数
 * @returns {number} - 返回斐波那契数列的第 n 项
 */
function fn3(n) {
    let a = 1 // 初始化第一个斐波那契数
    let b = 1 // 初始化第二个斐波那契数
    for (let i = 3; i <= n; i++) { // 从第三项开始循环计算斐波那契数
        [a, b] = [b, a + b] // 更新 a 和 b 的值，a 为前一项，b 为当前项
    }
    return b // 返回第 n 项的斐波那契数
}
