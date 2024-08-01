function Car(name) {
    this.name = name
    return [] // 构造函数return出的若是应用类型会干扰new
}

// let car = new Car('BMW')
// console.log(car);

// function myNew(...args) {
//     let obj = {

//     }
//     obj.__proto__ = args[0].prototype
//     let res = args[0].call(obj, ...args.slice(1))
//     return res instanceof Object ? res : obj
// }

/**
 * 自定义实现的new操作符
 * @param {Function} Constructor - 构造函数
 * @param {...any} args - 传递给构造函数的参数
 * @returns {Object} - 返回一个新对象
 */
function myNew(Constructor, ...args) {
    // 创建一个新对象，并将其原型指向构造函数的原型
    const obj = Object.create(Constructor.prototype);
    
    // 调用构造函数，并将this绑定到新对象上
    const result = Constructor.apply(obj, args);
    
    // 如果构造函数返回的是对象类型，则返回该对象，否则返回新创建的对象
    return (result && typeof result === 'object') ? result : obj;
}


let car = myNew(Car, 'Volvo', 1, 2)
console.log(car);