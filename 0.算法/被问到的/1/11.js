// {a:1,b:{c:1}} => {a:1,b.c:1}  对象拍平

/**
 * 将嵌套的对象拍平为单层对象
 * @param {Object} obj - 需要拍平的对象
 * @param {String} [prefix=''] - 用于递归时的键前缀
 * @returns {Object} - 拍平后的对象
 */
function flattenObject(obj, prefix = '') {
  let result = {}; // 初始化结果对象

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) { // 确保属性是对象自身的属性
      const value = obj[key];
      const newKey = prefix ? `${prefix}.${key}` : key; // 生成新的键名

      if (typeof value === 'object' && value !== null) { // 如果值是对象且不为null，递归拍平
        Object.assign(result, flattenObject(value, newKey)); // 合并递归结果
      } else {
        result[newKey] = value; // 否则直接赋值
      }
    }
  }

  return result; // 返回拍平后的对象
}


// 示例
const input = {a: 1, b: {c: 1}};
const output = flattenObject(input);
console.log(output); // {a: 1, 'b.c': 1}
