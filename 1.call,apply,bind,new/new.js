function Car(name) {
    this.name = name
    return [] // 构造函数return出的若是应用类型会干扰new
}


/**
 * 自定义实现的 new 操作符
 * @param {...any} args - 第一个参数是构造函数，后面的参数是构造函数的参数
 * @returns {Object} - 返回一个新创建的对象
 */
function myNew(...args) {
    // 创建一个空对象
    let obj = {}

    // 将空对象的原型指向构造函数的原型
    obj.__proto__ = args[0].prototype

    // 调用构造函数，并将构造函数的 this 指向新创建的对象
    let res = args[0].call(obj, ...args.slice(1))

    // 如果构造函数返回的是对象类型，则返回该对象，否则返回新创建的对象
    return res instanceof Object ? res : obj
}


let car = myNew(Car, 'Volvo', 1, 2)
console.log(car);