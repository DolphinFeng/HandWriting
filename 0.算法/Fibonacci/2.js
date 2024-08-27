// 动态规划实现斐波那契数列
function fb(n) {
    // 初始化前两个斐波那契数
    let list = [1, 1]
    // 从第3个数开始计算斐波那契数列
    for (let i = 2; i < n; i++) {
        // 当前数等于前两个数之和
        list[i] = list[i - 1] + list[i - 2]
    }
    // 返回第n个斐波那契数
    return list[n - 1]
}

// 输出第5个斐波那契数
console.log(fb(5));
