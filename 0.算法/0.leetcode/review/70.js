// 爬楼梯: 假设你正在爬楼梯。需要 n 阶你才能到达楼顶。每次你可以爬 1 或 2 个台阶。你有多少种不同的方法可以爬到楼顶呢？

let n = 2; // 需要爬的台阶数 有两种方法可以爬到楼顶。1. 1 阶 + 1 阶 2. 2 阶

function climbStairs (n) {
    if (n <= 1) return 1
    let dp = new Array(n + 1)

    dp[0] = 1
    dp[1] = 1

    for (let i = 2; i < dp.length; i++) {
        dp[i] = dp[i - 1] + dp[i - 2]
    }

    return dp[n]
}

console.log(climbStairs(n));