Car.prototype.width = 18

function Car (name) {
    this.name = name
    this.age = 18
}

let car = new Car('Volve')

// console.log(car.width);

function myNew (...args) {
    let obj = {}
    obj.__proto__ = args[0].prototype
    let res = args[0].call(obj, ...args.slice(1))
    return res instanceof Object ? res : obj
}

console.log(myNew());
