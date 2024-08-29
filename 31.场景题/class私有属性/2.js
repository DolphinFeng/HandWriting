class Person {
    // 私有字段
    #name;
    #age;

    constructor(name, age) {
        this.#name = name; // 私有属性
        this.#age = age;   // 私有属性
    }

    // 公共方法
    getDetails() {
        return `Name: ${this.#name}, Age: ${this.#age}`;
    }
}

const person = new Person('Alice', 30);
console.log(person.getDetails()); // 输出: Name: Alice, Age: 30
console.log(person.#name);        // 报错: SyntaxError: Private field '#name' must be declared in an enclosing class