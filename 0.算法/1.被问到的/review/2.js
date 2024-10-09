// 将 如下 obj 转换为 [ [ 'a', 1 ], [ 'b', 2 ], [ 'c', 3 ] ]
let obj = { a: 1, b: 2, c: 3 }

// console.log(Object.entries(obj));

function myEntries (obj) {
    let res = []
    for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
            res.push([key, obj[key]])
        }
    }
    return res
}

console.log(myEntries(obj));
