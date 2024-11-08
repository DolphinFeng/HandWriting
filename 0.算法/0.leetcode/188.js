const maxProfit = function (k, prices) {
    let n = prices.length;
    let profit = new Array(k);//和123题一样 求出所有k的状态
    // 初始化k次交易买入卖出的利润
    for (let j = 0; j <= k; j++) {
        profit[j] = {
            buy: -prices[0],//表示有股票
            sell: 0,//表示没有股票
        };
    }
    for (let i = 0; i < n; i++) {
        for (let j = 1; j <= k; j++) {
            //122题可以交易无数次，188交易k次，所以直接在加一层k循环就可以
          	//122最后的递推方程：
          	//sell = Math.max(sell, buy + prices[i]);
        		//buy = Math.max(buy, -prices[i]);
            profit[j] = {
                sell: Math.max(profit[j].sell, profit[j].buy + prices[i]),
                buy: Math.max(profit[j].buy, profit[j - 1].sell - prices[i]),
            };
        }
    }
    return profit[k].sell; //返回第k次清空手中的股票之后的最大利润
};

console.log(maxProfit(2, [2, 4, 1])); // 2
console.log(maxProfit(2, [3, 2, 6, 5, 0, 3])); // 7