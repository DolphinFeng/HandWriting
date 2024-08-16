Car.prototype.age = '18'

function Car (name, ...args) {
    this.name = name
    this.color = 'white'
    this.param = [...args]
    // return []
}

// let car = new Car('Volve')

// console.log(car.age);

function myNew (...args) {
    let obj = {}
    obj.__proto__ = args[0].prototype
    let res = args[0].call(obj, ...args.slice(1))
    return res instanceof Object ? res : obj
}

let car = myNew(Car, 'Volve', 1, 2, 3)
console.log(car);