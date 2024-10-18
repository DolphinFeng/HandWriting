class A {
    a = 1
    test(newValue) {
        console.log(this)
        this.a = newValue
    }
    test2 = (newValue) => {
        console.log(this);
        this.a = newValue
    }
}

// console.log(new A().test(1) === new A().test(1)) // undefined === undefined
// console.log(new A().test(2) === new A().test2(2)) // undefined === undefined

// const method1 = new A().test() // 没有用bind
// const instance = new A()
// const method3 = instance.test.bind(instance)
// method3(3)
// method1(1) // 为什么会报错
// const method2 = new A().test2
// method2(2)

const test = (newValue) => {
    // this.a = newValue
    console.log(this);
}

test(1)