function Car(name) {
    this.name = name
    return [] // 构造函数return出的若是应用类型会干扰new
}

// let car = new Car('BMW')
// console.log(car);

function myNew(...args) {
    let obj = {

    }
    obj.__proto__ = args[0].prototype
    let res = args[0].call(obj, ...args.slice(1))
    return res instanceof Object ? res : obj
}

let car = myNew(Car, 'Volvo', 1, 2)
console.log(car);