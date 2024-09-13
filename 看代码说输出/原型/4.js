class A {
    a = 1
    test(newValue) {
        this.a = newValue
    }
    test2 = (newValue) => {
        this.a = newValue
    }
}

console.log(new A().test(1) === new A().test(1)) // undefined === undefined
console.log(new A().test(2) === new A().test2(2)) // undefined === undefined

const method1 = new A().test
method1(1) // 为什么会报错
const method2 = new A().test2
method2(2)

