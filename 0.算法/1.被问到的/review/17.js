function createRedPacket (total, num) {
    let packets = []
    
    for (let i = 0; i < num - 1; i++) {
        let max = (total / (num - i)) * 2
        let amount = Math.random() * (max - 0.01) + 0.01
        amount = parseFloat(amount.toFixed(2))
        packets.push(amount)
        total -= amount
    }

    packets.push(parseFloat(total.toFixed(2)))
    packets.sort(() => Math.random() - 0.5)
    return packets
}


// 测试用例
const packets = createRedPacket(200, 10)
console.log(packets);

console.log('数据之和为', packets.reduce((a, b) => a + b).toFixed(2), 0); 