function getThousandSign(n) {
    let str = n.toString()
    const res = []
    let len = str.length
    for (let i = len; i > 0; i -= 3) {
        let block = str.subString(i - 3, i)
        res.unshift(block)
    }
    return res.join(',')
}

console.log(getThousandSign(10000))

// 考虑小数
// function getThousandSign(num) {
//     let str = num.toString().split('.')[0]
//     let res = []
//     let len = str.length
//     for (let i = len; i > 0; i -= 3) {
//         let block = str.substring(i - 3, i)
//         res.unshift(block)
//     }
//     return res.join(',') + '.' + num.toString().split('.')[1]
// }