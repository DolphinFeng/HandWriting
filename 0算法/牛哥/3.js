// 反转几位数  对称就可以靠栈来完成
// 123 -> 321  900->9
let n = 900

const reverseNum = (n) => {
    let arr = n.toString().split('').reverse().join('') // 字符串->数组->反转->字符串
    return Number(arr)
}

console.log(reverseNum(n));