// 2218. 从栈中取出 K 个硬币的最大剩余价值

/**
 * @param {number[][]} piles
 * @param {number} k
 * @return {number}
 */
var maxValueOfCoins = function(piles, k) {
    const n = piles.length;
    // dp[i][j] 表示从前i个栈中取出j个硬币的最大价值
    const dp = Array(n + 1).fill(0).map(() => Array(k + 1).fill(0));
    
    // 遍历每个栈
    for (let i = 1; i <= n; i++) {
        for (let j = 0; j <= k; j++) {
            let sum = 0; // 当前栈取出的硬币总和
            // 从当前栈中取出的硬币数量
            for (let x = 0; x <= Math.min(j, piles[i-1].length); x++) {
                if (x > 0) {
                    sum += piles[i-1][x-1];
                }
                // 状态转移：不取当前栈 或 取当前栈的x个硬币
                dp[i][j] = Math.max(dp[i][j], dp[i-1][j-x] + sum);
            }
        }
    }
    
    return dp[n][k];
};

// 测试代码
let piles = [[1, 15, 7], [2, 6, 14], [1, 3, 12]], k = 3;
console.log(maxValueOfCoins(piles, k));
