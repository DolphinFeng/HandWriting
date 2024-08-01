// 10个红包

function createRedPacket (sum, num) {
    let packets = []

    for (let i = 0; i < num - 1; i++) {
        let amount = Math.random()*(sum / (num - i) * 2 - 0.01) + 0.01
        amount = parseFloat(amount.toFixed(2))
        packets.push(amount)
        sum -= amount
    }

    packets.push(parseFloat(sum.toFixed(2)))
    packets.sort(() => Math.random() - 0.5)
    return packets
}

console.log(createRedPacket(100, 10));