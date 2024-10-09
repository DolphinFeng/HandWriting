// 买卖股票：给定一个数组 prices ，它的第 i 个元素 prices[i] 表示一支给定股票第 i 天的价格。

// 你只能选择 某一天 买入这只股票，并选择在 未来的某一个不同的日子 卖出该股票。设计一个算法来计算你所能获取的最大利润。

// 返回你可以从这笔交易中获取的最大利润。如果你不能获取任何利润，返回 0 。

let prices = [7,1,5,3,6,4] // 5

var maxProfit = function(prices) {
    let n = prices.length;
    let sell = 0;
    let buy = -prices[0];
    for (let i = 1; i < n; i++) {
        sell = Math.max(sell, buy + prices[i]);
        buy = Math.max(buy, -prices[i]);
    }
    return sell;

};

console.log(maxProfit(prices)); // 输出 5
