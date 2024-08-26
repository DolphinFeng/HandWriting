// 100 拆成两部分  相加和最大   10 + 0   -10  -1 + 0 

/**
 * 将一个数字拆分成两部分，并计算两部分的和，返回最大和
 * @param {number} number - 需要拆分的数字
 * @returns {number} - 拆分后两部分和的最大值
 */
function splitAndMaximizeSum(number) {
    // 将数字转换为字符串，便于拆分
    let strNum = number.toString();
    // 初始化最大和为负无穷大
    let maxSum = -Infinity;

    // 遍历字符串的每一个位置，将其拆分成两部分
    for (let i = 1; i < strNum.length; i++) {
        // 将字符串拆分成两部分并转换为整数
        let part1 = parseInt(strNum.slice(0, i));
        let part2 = parseInt(strNum.slice(i));
        // 计算两部分的和
        let sum = part1 + part2;
        // 更新最大和
        if (sum > maxSum) {
            maxSum = sum;
        }
    }

    // 返回最大和
    return maxSum;
}


console.log(splitAndMaximizeSum(100)); // 输出 10
console.log(splitAndMaximizeSum(-10)); // 输出 -1
