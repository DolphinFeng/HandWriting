// 零钱兑换

var coinChange = function(coins, amount) {
    const dp = new Array()
    dp.push(0)

    for (let i = 0; i < amount; i++) {
        dp.push(amount + 1)
    }

    for (let i = 1; i < amount + 1; i++) {
        for (let j = 0; j < coins.length; j++) {
            if (i >= coins[j]) {
                dp[i] = Math.min(dp[i], dp[i - coins[j]] + 1)
            }
        }
    }

    return dp[amount] > amount ? -1 : dp[amount]
};

let coins = [1, 2, 5], amount = 11
console.log(coinChange(coins, amount)) // 输出：3