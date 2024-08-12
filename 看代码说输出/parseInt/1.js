// map 会传递三个参数给 parseInt，分别是 item ,index, arr，但是 parseInt 只接受两个参数，会自动砍掉第三个参数，第一个参数是原数据，第二个参数是描述第一个参数的进制

const arr = [1, 2, 3]
const newArr = arr.map(parseInt)
console.log(newArr)
