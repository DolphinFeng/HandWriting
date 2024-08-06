let arr = [1, 1, '2', 3, 1, 2,
    { name: '张三', id: { n: 1 } },
    { name: '张三', id: { n: 1 } },
    { name: '张三', id: { n: 2 } },
    { a:1, b:2 },
    { b:2, a:1 }
]

/**
 * 过滤数组中的重复元素
 * @param {Array} arr - 需要过滤的数组
 * @returns {Array} - 过滤后的数组
 */
function filterData(arr) {
    // 创建一个 Map 用于存储唯一元素
    let map = new Map()
    // 存储结果的数组
    let res = []
    // 遍历数组中的每一个元素
    arr.forEach((item) => {
        let key = ''
        // 如果元素是对象类型，生成一个唯一的 key
        if (typeof item === 'object') {
            key = `${item.id}-${item.name}`
        } else {
            // 如果元素不是对象类型，直接使用元素值作为 key
            key = item
        }
        // 如果 Map 中不存在该 key，则将其添加到 Map 和结果数组中
        if (!map.get(key)) {
            map.set(key, key)
            res.push(item)
        }
    })
    // 返回过滤后的结果数组
    return res
}

// 打印过滤后的数组
console.log(filterData(arr));
