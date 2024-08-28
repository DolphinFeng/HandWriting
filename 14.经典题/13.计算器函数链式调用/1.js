class Chainable {
    constructor(value = 0) {
        this.value = value;
    }

    add(num) {
        this.value += num;
        return this; // 返回对象本身
    }

    subtract(num) {
        this.value -= num;
        return this; // 返回对象本身
    }

    multiply(num) {
        this.value *= num;
        return this; // 返回对象本身
    }

    divide(num) {
        if (num !== 0) {
            this.value /= num;
        } else {
            console.error("Cannot divide by zero");
        }
        return this; // 返回对象本身
    }

    getValue() {
        return this.value;
    }
}

// 示例用法
const result = new Chainable(10)
    .add(5)
    .subtract(3)
    .multiply(4)
    .divide(2)
    .getValue();

console.log(result); // 输出: 24