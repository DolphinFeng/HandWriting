function Car () {
    this.name = 'NIO'
    // return []
}

// let car = new Car()

// console.log(car);

function myNew (Constructor, ...args) {
    const obj = Object.create(Constructor.prototype)
    const result = Constructor.apply(obj, args)
    return (result && typeof result === 'object') ? result : obj
}

let car = myNew(Car)
console.log(car);