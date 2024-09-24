function Car (name) {
    this.name = name
    // return []
}

// let car = new Car('volve')
// console.log(car);

function myNew (...args) {
    let obj = {}
    obj.__proto__ = args[0].prototype
    let res = args[0].call(obj, ...args.slice(1))
    return res instanceof Object ? res : obj
}

let car = myNew(Car, 'volve')
console.log(car);
