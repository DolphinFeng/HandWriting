/**
 * 将对象的键从下划线命名转换为驼峰命名
 * @param {Object} obj - 需要转换的对象
 * @returns {Object} - 转换后的新对象
 */
function pascalToCamel(obj) {
    // 检查输入是否为对象且不为null
    if (typeof obj !== 'object' || obj === null) return

    // 创建一个新的对象用于存储转换后的键值对
    let newObj = {}

    // 遍历对象的每一个键
    for (let key in obj) {
        // 确保键是对象自身的属性
        if (obj.hasOwnProperty(key)) {
            // 将键按下划线分割成数组
            const arr = key.split('_')
            // 将数组的第一个元素保留，后续元素首字母大写后拼接
            const newKey = arr[0] + arr.slice(1).map((item) => {
                return item[0].toUpperCase() + item.slice(1)
            }).join('')

            // 将转换后的键值对存入新对象
            newObj[newKey] = obj[key]
        }
    }

    // 返回转换后的新对象
    return newObj
}

// 示例对象
const obj = {
    user_name: 'Tony',
    current_position: 'developer',
    age: 45
}

// 输出转换后的对象
console.log(pascalToCamel(obj))
