// 手写：class私有属性 两种实现方法
// 命名前加一个 _ 表示私有属性，不过这是个约定，不能真限制

class Person {
    constructor(name, age) {
        this._name = name; // 私有属性
        this._age = age;   // 私有属性
    }

    // 公共方法
    getDetails() {
        return `Name: ${this._name}, Age: ${this._age}`;
    }
}

const person = new Person('Alice', 30);
console.log(person.getDetails()); // 输出: Name: Alice, Age: 30
console.log(person._name);        // 仍然可以访问: Alice