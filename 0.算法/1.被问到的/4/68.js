// 0 1 1 2  tribonacci
// T_3 = 0 + 1 + 1 = 2
// T_4 = 1 + 1 + 2 = 4

function tribonacci(n) {
    if (n === 0) return 0;
    if (n === 1 || n === 2) return 1;

    let sequence = [0, 1, 1];
    for (let i = 3; i <= n; i++) {
        sequence[i] = sequence[i - 1] + sequence[i - 2] + sequence[i - 3];
    }
    return sequence[n];
}

// 示例用法:
console.log(tribonacci(0)); // 输出: 0
console.log(tribonacci(1)); // 输出: 1
console.log(tribonacci(2)); // 输出: 1
console.log(tribonacci(3)); // 输出: 2
console.log(tribonacci(4)); // 输出: 4
console.log(tribonacci(5)); // 输出: 7
console.log(tribonacci(6)); // 输出: 13
console.log(tribonacci(7)); // 输出: 24