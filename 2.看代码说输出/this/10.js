// 百度笔试

class cls {
    constructor () {
        this.num = 117;
        return {
            num: 130
        }
    }
}

cls.prototype.constructor.bind({num: 935})
const son = new cls()
console.log(son.num);
