let n = 153

const isWaterFlower = (n) => {
    let str = n.toString()
    // 拿到数字的长度
    let len = n.toString().length
    // 拿到每个数
    let total = 0
    for (let i = 0; i < len; i++) {
        total += str[i]**len
    }
    return total === n
}

console.log(isWaterFlower(n));