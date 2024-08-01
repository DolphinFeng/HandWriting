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

//   输出：
//   name = 小明
//   info.age = 18
//   info.address.country = 中国
//   info.address.province = 广东

function print(obj, parentKey = '', res = {}) {
    for (let key in obj) {
        const fullPath = parentKey ? `${parentKey}.${key}` : key
        if (obj[key] instanceof Object) {
            print(obj[key], fullPath, res)
        } else {
            res[fullPath] = obj[key]
        }
    }
    return res
}

console.log(print(person));