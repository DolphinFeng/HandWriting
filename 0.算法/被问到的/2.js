// 将 如下 obj 转换为 [ [ 'a', 1 ], [ 'b', 2 ], [ 'c', 3 ] ]
let obj = { a: 1, b: 2, c: 3 }

/**
 * 将对象转换为键值对数组
 * @param {Object} obj - 需要转换的对象
 * @returns {Array} - 返回键值对数组
 */
const objectToArray = (obj) => {
  // 使用 Object.entries 方法将对象转换为键值对数组
  return Object.entries(obj);
};

const result = objectToArray(obj);

console.log(result);


/**
 * 手写实现 Object.entries 方法
 * @param {Object} obj - 需要转换的对象
 * @returns {Array} - 返回键值对数组
 */
function myEntries(obj) {
    let entries = []
    for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
            entries.push([key, obj[key]])
        }
    }
    return entries
}

console.log(myEntries(obj));