function Parent() {
    this.name = 'father'
}

Child.prototype = Object.create(Parent.prototype) // 原型式继承  寄生组合继承
// Child.prototype = new Parent() // 原型链继承  无法传参  原型可以被修改
Child.prototype.constructor = Child // 组合继承 / 经典继承

function Child() {
    Parent.call(this) // 构造函数继承  无法继承到父类原型身上的方法
    this.age = 18
}

let c = new Child()

console.log(c.name);