var person = {
    "name": "小明",
    "info": {
        "age": "18",
        "address": {
            "country": "中国",
            "province": "广东",
        }
    }
}

//   实现一个函数返回如下：
//   name = 小明
//   info.age = 18
//   info.address.country = 中国
//   info.address.province = 广东


/**
 * 递归遍历对象，将其属性路径和值存储在结果对象中
 * @param {Object} obj - 要遍历的对象
 * @param {String} parentKey - 当前属性的父路径
 * @param {Object} res - 存储结果的对象
 * @returns {Object} - 包含属性路径和值的结果对象
 */
function print(obj, parentKey = '', res = {}) {
    // 遍历对象的每个属性
    for (let key in obj) {
        // 构建当前属性的完整路径
        const fullPath = parentKey ? `${parentKey}.${key}` : key;
        // 如果属性值是对象且不是数组，递归调用print函数
        if (obj[key] instanceof Object && !Array.isArray(obj[key])) {
            print(obj[key], fullPath, res);
        } else {
            // 否则，将属性路径和值存储在结果对象中
            res[fullPath] = obj[key];
        }
    }
    // 返回结果对象
    return res;
}
const result = print(person);

for (let key in result) {
    console.log(`${key} = ${result[key]}`);
}