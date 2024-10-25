let a = 1;
function foo(a) {
  return (a = a + 1);
}
var b = foo(a);
function foo(a) {
  return (a = a + 2);
}
const c = foo(a);
console.info(a, b, c); //  1 3 3 console.info 其实就是 console.log

// 这题就是考察编译阶段的变量提升和函数提升，以及函数声明和函数表达式的区别。