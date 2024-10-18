function Foo() {
    Foo.a = function () {
        console.log(1);
    };
    this.a = function () {
        console.log(2);
    };
}

Foo.prototype.a = function () {
    console.log(4);
};

Function.prototype.a = function () {
    console.log(3);
};


Foo.a(); // 3

let obj = new Foo(); // 实例化时，函数执行带来的效果，把a挂在了Foo构造函数身上
obj.a(); // 2
Foo.a(); // 1


// https://juejin.cn/post/7079681931662589960#heading-2  16题