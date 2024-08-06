/**
 * 自定义的instanceOf函数，用于判断对象L是否是构造函数R的实例
 * @param {Object} L - 需要判断的对象
 * @param {Function} R - 构造函数
 * @returns {boolean} - 如果L是R的实例，返回true，否则返回false
 */
function instanceOf(L, R) {
    // 获取对象L的原型
    let left = L.__proto__;
    // 获取构造函数R的原型
    let right = R.prototype;
    // 循环遍历对象L的原型链
    while (left !== null) {
        // 如果找到相同的原型，返回true
        if (left === right) return true;
        // 继续向上查找原型链
        left = left.__proto__;
    }
    // 如果遍历完原型链没有找到，返回false
    return false;
}

// 创建一个数组对象
let arr = [];
// 使用原生instanceof操作符判断arr是否是Array的实例
console.log(arr instanceof Array); // true
// 使用原生instanceof操作符判断arr是否是Object的实例
console.log(arr instanceof Object); // true

// 使用自定义的instanceOf函数判断arr是否是Array的实例
console.log(instanceOf(arr, Array)); // true
// 使用自定义的instanceOf函数判断arr是否是Object的实例
console.log(instanceOf(arr, Object)); // true
