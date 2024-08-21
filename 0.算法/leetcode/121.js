// 买卖股票：给定一个数组 prices ，它的第 i 个元素 prices[i] 表示一支给定股票第 i 天的价格。

// 你只能选择 某一天 买入这只股票，并选择在 未来的某一个不同的日子 卖出该股票。设计一个算法来计算你所能获取的最大利润。

// 返回你可以从这笔交易中获取的最大利润。如果你不能获取任何利润，返回 0 。

let prices = [7,1,5,3,6,4] // 5

function maxProfit(prices) {
    let minPrice = Infinity; // ��始化最低价格为无穷大
    let maxProfit = 0; // 初始化最大利润为0

    for (let price of prices) {
        if (price < minPrice) {
            minPrice = price; // 更新最低价格
        } else if (price - minPrice > maxProfit) {
            maxProfit = price - minPrice; // 更新最大利润
        }
    }

    return maxProfit; // 返回最大利润
}


console.log(maxProfit(prices)); // 输出 5
