class Chain {
    constructor (num) {
        this.num = num
    }

    add (num) {
        this.num += num
        return this
    }

    subtract (num) {
        this.num -= num
        return this
    }

    multiply (num) {
        this.num *= num
        return this
    }

    divide (num) {
        if (num === 0) {
            console.error('除数不能为0')
        }
        this.num /= num
        return this
    }

    getValue () {
        return this.num
    }
}
const compute = new Chain(10)
console.log(compute.add(5).subtract(3).multiply(2).divide(1).getValue());
