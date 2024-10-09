// {a:1,b:{c:1}} => {a:1,b.c:1}  对象拍平

function flattenObject (obj, parentKey = '', res = {}) {
  for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
          const fullKey = parentKey ? `${parentKey}.${key}` : key
          if (obj[key] instanceof Object && !Array.isArray(obj[key])) {
              flattenObject(obj[key], fullKey, res)
          } else {
              res[fullKey] = obj[key]
          }
      }
  }
  
  return res
}

// 示例
const input = {a: 1, b: {c: 1}};
const output = flattenObject(input);
console.log(output); // {a: 1, 'b.c': 1}
