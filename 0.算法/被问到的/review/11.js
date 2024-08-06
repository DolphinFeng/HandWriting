// {a:1,b:{c:1}} => {a:1,b.c:1}  对象拍平



function flattenObject (obj, prefix = '') {
    let res = {}

    for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
            let newKey = prefix ? `${prefix}.${key}` : key
            if (typeof obj[key] === 'object' && obj[key] !== null) {
                Object.assign(res, flattenObject(obj[key], newKey))
            } else {
                res[newKey] = obj[key]
            }
        }
    }

    return res
}
  

// 示例
const input = {a: 1, b: {c: 1}};
const output = flattenObject(input);
console.log(output); // {a: 1, 'b.c': 1}
