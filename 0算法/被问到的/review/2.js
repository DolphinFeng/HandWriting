// 将 如下 obj 转换为 [ [ 'a', 1 ], [ 'b', 2 ], [ 'c', 3 ] ]
let obj = { a: 1, b: 2, c: 3 }

// console.log(Object.entries(obj));

function myEntries (obj) {
    let entries = []
    for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
            entries.push([key, obj[key]])
        }
    }
    return entries
}

console.log(myEntries(obj));