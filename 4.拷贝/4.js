/**
 * 深拷贝对象
 * @param {Object} obj - 需要深拷贝的对象
 * @returns {Object} - 深拷贝后的新对象
 */
function deepCopy(obj) {
    // 使用 structuredClone 方法进行深拷贝
    return structuredClone(obj);
    // return JSON.parse(JSON.stringify(obj))
}


let obj = {
    a: 1
}

let objCopy = deepCopy(obj)

obj.a = 2

console.log(objCopy);