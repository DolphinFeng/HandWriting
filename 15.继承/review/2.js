class Parent {
    constructor(name) {
        this.name = 'Tom'
    }
}

class Child extends Parent {
    constructor(name) {
        super(name)
        this.age = 18
    }
}

let c = new Child()
console.log(c.name);