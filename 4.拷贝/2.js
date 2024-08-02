/**
 * 深拷贝一个对象或数组
 * @param {Object|Array} obj - 需要深拷贝的对象或数组
 * @returns {Object|Array} - 深拷贝后的新对象或数组
 */
function deepCopy(obj) {
    // 判断传入的对象是数组还是对象，并创建相应的空数组或空对象
    const objCopy = Array.isArray(obj) ? [] : {}
    
    // 遍历对象的每一个属性
    for (let key in obj) {
        // 确保属性是对象自身的属性，而不是原型链上的属性
        if (obj.hasOwnProperty(key)) {
            // 如果属性值是对象，则递归调用deepCopy进行深拷贝
            if (obj[key] instanceof Object) {
                objCopy[key] = deepCopy(obj[key])
            } else {
                // 如果属性值不是对象，直接赋值
                objCopy[key] = obj[key]
            }
        }
    }
    // 返回深拷贝后的新对象或数组
    return objCopy
}


let obj = {
    a: 1
}
let objCopy = deepCopy(obj)
obj.a = 2
console.log(objCopy);
