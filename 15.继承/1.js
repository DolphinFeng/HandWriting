function Parent() {
    this.name = 'father'
}

Child.prototype = Object.create(Parent.prototype)
Child.prototype.constructor = Child

function Child() {
    Parent.call(this)
    this.age = 18
}

let c = new Child()

console.log(c.name);