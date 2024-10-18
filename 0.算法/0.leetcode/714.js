const maxProfit = function (prices, fee) {
    let sell = 0;//卖出
    let buy = -prices[0];//买入
    for (let i = 1; i < prices.length; i++) {
        sell = Math.max(sell, buy + prices[i] - fee);
        buy = Math.max(buy, sell - prices[i]);
    }
    return sell;
};

console.log(maxProfit([1, 3, 2, 8, 4, 9], 2)); // 8
console.log(maxProfit([1, 3, 7, 5, 10, 3], 3)); // 6
