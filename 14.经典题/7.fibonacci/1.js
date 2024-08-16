// 递归实现斐波那契数列
function fb(n) {
    // 如果 n 是 1 或 2，返回 1（斐波那契数列的前两项都是 1）
    if (n === 1 || n === 2) {
        return 1;
    }
    // 否则，返回前两项之和
    return fb(n - 1) + fb(n - 2);
}

// 输出斐波那契数列的第 5 项
console.log(fb(5));
