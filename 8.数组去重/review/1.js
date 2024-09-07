let arr = [1, 1, '2', 3, 1, 2,
    { name: '张三', id: { n: 1 } },
    { name: '张三', id: { n: 1 } },
    { name: '张三', id: { n: 2 } },
    { a:1, b:2 },
    { b:2, a:1 }
]

function unique (arr) {
    let res = []
    for (let item of arr) {
        let isFind = false
        for (restItem of res) {
            if (equal(item, restItem)) {
                isFind = true
                break
            }
        }
        if (!isFind) {
            res.push(item)
        }
    }
    return res
}

function equal (v1, v2) {
    if ((typeof v1 === 'object' && v1 !== null) && (typeof v2 === 'object' && v2 !== null)) {
        if (Object.keys(v1).length !== Object.keys(v2).length) return false
        for (let key in v1) {
            if (v2.hasOwnProperty(key)) {
                if (!equal(v1[key], v2[key])) {
                    return false
                }
            } else {
                return false
            }
        }
        return true
    } else {
        return v1 === v2
    }
}

console.log(unique(arr));
