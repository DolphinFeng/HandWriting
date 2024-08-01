// { a: 1, b: 2, c: 3 } -> [['a', 1], ['b', 2], ['c', 3]]

let obj = { a: 1, b: 2, c: 3 }

let arr = []

for (let item in obj) {
    arr.push(item, obj[item])
}

let res = []
for (let i = 0; i < arr.length; i += 2) {
    res.push(arr.slice(i, i + 2))
}

console.log(res);

// for in 遍历对象，其key本身就是string类型，无需转换，然后将key，obj[key]都同时放进数组形成一维数组
// 然后在新建一个数组，用于存入二维

// 转回去