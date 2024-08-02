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

function print (obj, parentKey = '', res = {}) {
    for (let key in obj) {
        let fulPath = parentKey ? `${parentKey}·${key}` : key
        if (obj[key] instanceof Object && !Array.isArray(obj[key])) {
            print(obj[key], fulPath, res)
        } else {
            res[fulPath] = obj[key]
        }
    }
    return res
}

const result = print(person);

for (let key in result) {
    console.log(`${key} = ${result[key]}`);
}