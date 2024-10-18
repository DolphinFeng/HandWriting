function maxProfit(prices) {
    let profit = 0;    // 收益
    for (let i = 1; i < prices.length; i++) {
        const diff = prices[i] - prices[i - 1]; // 今天和昨天的差价
        if (diff > 0) {			   // 差价大于0
            profit += diff;			   // 今天卖掉，赚了今天和昨天的差价
        }
    }
    return profit;
}

console.log(maxProfit([7, 1, 5, 3, 6, 4])); // 输出 7
console.log(maxProfit([1, 2, 3, 4, 5])); // 输出 4
