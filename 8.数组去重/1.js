let arr = [1, 1, '2', 3, 1, 2,
    { name: '张三', id: { n: 1 } },
    { name: '张三', id: { n: 1 } },
    { name: '张三', id: { n: 2 } },
    { a:1, b:2 },
    { b:2, a:1 }
]

/**
 * 去重函数
 * @param {Array} arr - 需要去重的数组
 * @returns {Array} - 去重后的数组
 */
function unique (arr) {
    let res = [] // 存储去重后的结果数组
    for (let item of arr) {
        let isFind = false // 标记当前元素是否在结果数组中找到
        for (let resItem of res) {
            if (equal(item, resItem)) { // 如果找到相同元素
                isFind = true
                break
            }
        }
        if (!isFind) res.push(item) // 如果没有找到相同元素，则将当前元素加入结果数组
    }
    return res
}

/**
 * 比较两个值是否相等
 * @param {*} v1 - 第一个值
 * @param {*} v2 - 第二个值
 * @returns {boolean} - 是否相等
 */
function equal (v1, v2) {
    if ((typeof v1 === 'object' && v1 !== null) && (typeof v2 === 'object' && v2 !== null)) { // 如果两个值都是对象
        if (Object.keys(v1).length !== Object.keys(v2).length) return false // 如果对象的键数量不同，则不相等
        for (let key in v1) {
            if (v2.hasOwnProperty(key)) { // 如果v2中也有相同的键
                if (!equal(v1[key], v2[key])) { // 递归比较键对应的值
                    return false
                }
            } else {
                return false // 如果v2中没有相同的键，则不相等
            }
        }
        return true // 所有键和值都相等，则对象相等
    } else {
        return v1 === v2 // 如果不是对象，直接比较值是否相等
    }
}

console.log(unique(arr)); // 输出去重后的数组
