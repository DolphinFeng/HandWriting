// 这其实就是作用域链，函数找值的就是顺着作用域链找的，函数的查找就是顺着函数声明的位置，而非调用位置

var a = 2;
function foo(){
    console.log(a)
}
function bar(){
    var a = 3; // 并不会覆盖全局 a
    foo();
}
bar()