//和前面一样 我们直接降维
const maxProfit = function (prices) {
    let buy_1 = -prices[0], sell_1 = 0
    let buy_2 = -prices[0], sell_2 = 0
    let n = prices.length
    for (let i = 1; i < n; i++) {
        sell_2 = Math.max(sell_2, buy_2 + prices[i])
        buy_2 = Math.max(buy_2, sell_1 - prices[i])
        sell_1 = Math.max(sell_1, buy_1 + prices[i])
        buy_1 = Math.max(buy_1, -prices[i])
    }
    return sell_2
}

console.log(maxProfit([3, 3, 5, 0, 0, 3, 1, 4])) // 6
console.log(maxProfit([1, 2, 3, 4, 5])) // 4;