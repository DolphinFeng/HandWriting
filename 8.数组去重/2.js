let arr = [1, 1, '2', 3, 1, 2,
    { name: '张三', id: { n: 1 } },
    { name: '张三', id: { n: 1 } },
    { name: '张三', id: { n: 2 } },
    { a:1, b:2 },
    { b:2, a:1 }
]

function filterData(arr) {
    let map = new Map()
    let res = []
    arr.forEach((item) => {
        let key = ''
        if (typeof item === 'object') {
            key = `${item.id}-${item.name}`
        } else {
            key = item
        }
        if (!map.get(key)) {
            map.set(key, key)
            res.push(item)
        }
    })
    return res
}

console.log(filterData(arr));