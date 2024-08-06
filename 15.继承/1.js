/**
 * 定义父类构造函数 Parent
 * @constructor
 */
function Parent() {
    this.name = 'father'; // 初始化父类的 name 属性
}

/**
 * 定义子类构造函数 Child
 * @constructor
 */
function Child() {
    Parent.call(this); // 调用父类构造函数，继承父类的属性
    this.age = 18; // 初始化子类的 age 属性
}

// 设置子类的原型为父类的一个实例，实现继承
Child.prototype = Object.create(Parent.prototype);

// 修正子类构造函数的指向
Child.prototype.constructor = Child;

// 创建子类的一个实例
let c = new Child();

// 输出子类实例的 name 属性
console.log(c.name); // 输出 'father'
