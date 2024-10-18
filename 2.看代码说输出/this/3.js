const obj = {
    a: 9,
    fn1: function () {
        function fn () {
            console.log(this.a);
        }
        fn()
    }
}

obj.fn1() // undefined 函数在对象中执行了，就是指向全局，默认绑定