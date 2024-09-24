/**
 * 浅拷贝一个对象或数组
 * @param {Object|Array} obj - 需要拷贝的对象或数组
 * @returns {Object|Array} - 拷贝后的新对象或数组
 */
function shallowCopy(obj) {
    if (typeof obj !== 'object' || obj === null) return;
    
    let objCopy = obj instanceof Array ? [] : {};
    
    for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
            objCopy[key] = obj[key];
        }
    }
    
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