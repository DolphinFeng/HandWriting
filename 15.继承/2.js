// 定义一个父类 Parent
class Parent {
    // 构造函数，初始化 name 属性
    constructor(name) {
        this.name = name
    }

    // 获取 name 属性的方法
    getName() {
        return this.name
    }
}

// 定义一个子类 Child，继承自 Parent
class Child extends Parent {
    // 构造函数，初始化 name 属性并调用父类的构造函数
    constructor(name) {
        super(name) // super 让子类传参给父类
        this.age = 18 // 初始化 age 属性
    }
}

// 创建一个 Child 类的实例
let child = new Child('Tom')

// 输出实例的 name 属性
console.log(child.name); // Tom
