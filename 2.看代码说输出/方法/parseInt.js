// map 会传递三个参数给 parseInt，分别是 item ,index, arr，但是 parseInt 只接受两个参数，会自动砍掉第三个参数，第一个参数是原数据，第二个参数是描述第一个参数的进制

const arr = [1, 2, 3]
const newArr = arr.map(parseInt)
console.log(newArr)

// parseInt(1, 0)：基数为 0 时，parseInt 会将其视为 10，所以结果是 1。
// parseInt(2, 1)：基数为 1 是无效的，所以结果是 NaN。
// parseInt(3, 2)：基数为 2 时，3 不是有效的二进制数字，所以结果是 NaN。