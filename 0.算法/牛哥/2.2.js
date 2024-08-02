// 找到三位数中所有的水仙花数

const findAll = (n) => {
    let max = 10**n - 1 // 最大值
    let min = 10**(n - 1)
    let arr = []
    for (let i = min; i < max; i++) {
        if (isWaterFlower(i)) {
            arr.push(i)
        }
    }
    return arr
}

// 判断是否为水仙花数
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

console.log(findAll(3));