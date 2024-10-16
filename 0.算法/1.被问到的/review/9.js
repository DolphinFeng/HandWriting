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
        let fullPath = parentKey ? `${parentKey}.${key}` : key
        if (obj[key] instanceof Object && !Array.isArray(obj[key])) {
            print(obj[key], fullPath, res)
        } else {
            res[fullPath] = obj[key]
        }
    }
    return res
}

const newObj = print(person)

for (let key in newObj) {
    console.log(`${key} = ${newObj[key]}`); 
}