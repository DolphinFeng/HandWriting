const maxProfit = (prices) => {
    let rest = 0;
    let sold = 0;
    let hold = -Infinity; // 还没买入
    for (let price of prices) {
        let preSold = sold;
        let preHold = hold;
        hold = Math.max(preHold, rest - price);
        sold = preHold + price;
        rest = Math.max(rest, preSold);
    }
    return Math.max(rest, sold);
};


console.log(maxProfit([1, 2, 3, 0, 2])); // 3
console.log(maxProfit([1, 2, 4])); // 3
