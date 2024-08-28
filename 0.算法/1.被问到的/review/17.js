
function createRedPacket(tn, num) {
    let packets = []

    for (let i = 0; i < tn - 1; i++) {
        let max = tn / (num - i) * 2
        let amount = Math.random() * (max - 0.01) + 0.01
        packets.push(parseFloat(amount.toFixed(2)))
        tn -= amount
    }
    
    packets.push(parseFloat(tn.toFixed(2)))
    packets.sort(() => {
        Math.random() - 0.5
    })
    return packets
}

console.log(createRedPacket(100, 10));