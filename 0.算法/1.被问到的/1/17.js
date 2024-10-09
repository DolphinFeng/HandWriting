//有 10 个 红包，总额 100，需要保证每个红包的公平性，但又是随机的

/**
 * 创建随机红包
 * @param {number} totalAmount - 红包总金额
 * @param {number} totalCount - 红包总数量
 * @returns {number[]} - 随机分配的红包金额数组
 */
function createRedPacket(totalAmount, totalCount) {
    let packets = []; // 存储每个红包金额的数组

    for (let i = 0; i < totalCount - 1; i++) {
        // 计算当前红包的最大金额
        let max = (totalAmount / (totalCount - i)) * 2;
        // 生成随机金额，保证每个红包至少有0.01，生成一个在 0.01 到 max 之间的随机数。
        let amount = Math.random() * (max - 0.01) + 0.01; 
        amount = parseFloat(amount.toFixed(2)); // 保留两位小数，parseFloat("3.14") 将返回浮点数 3.14。
        packets.push(amount); // 将生成的金额加入数组
        totalAmount -= amount; // 减去已分配的金额
    }

    // 最后一个红包的金额
    packets.push(parseFloat(totalAmount.toFixed(2)));
    // 打乱红包顺序
    packets.sort(() => Math.random() - 0.5);
    return packets; // 返回随机分配的红包金额数组
}


// 测试用例
const packets = createRedPacket(200, 10)
console.log(packets);

console.log('数据之和为', packets.reduce((a, b) => a + b).toFixed(2), 0); 