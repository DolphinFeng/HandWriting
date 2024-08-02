/**
 * 浅拷贝一个对象或数组
 * @param {Object|Array} obj - 需要拷贝的对象或数组
 * @returns {Object|Array} - 拷贝后的新对象或数组
 */
function shallowCopy(obj) {
    // 如果传入的不是对象或数组，或者是null，直接返回
    if (typeof obj !== 'object' || obj === null) return;
    
    // 判断传入的是数组还是对象，并创建相应的空数组或空对象
    let objCopy = obj instanceof Array ? [] : {};
    
    // 遍历对象的每一个属性
    for (let key in obj) {
        // 只拷贝对象自身的属性，不拷贝原型链上的属性
        if (obj.hasOwnProperty(key)) {
            // 将属性值赋值给新对象
            objCopy[key] = obj[key];
        }
    }
    
    // 返回拷贝后的新对象或数组
    return objCopy;
}


let obj = {
    a: {
        b: 1
    }
}

let objCopy = shallowCopy(obj)
obj.a.b = 2

console.log(objCopy);