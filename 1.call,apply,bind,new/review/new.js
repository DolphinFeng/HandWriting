function Car () {
    this.name = 'NIO'
    // return []
}

// let car = new Car()

// console.log(car);

function myNew (...args) {
    let obj = {}
    obj.__proto__ = args[0].prototype
    let res = args[0].call(obj, ...args.slice(1))
    return res instanceof Object ? res : obj
}

let car = myNew(Car)
console.log(car);