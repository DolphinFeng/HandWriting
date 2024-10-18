// 基本属性是不可以拥有属性的，默认就是 undefined

var a = 1
var b = a
a=3
b.name = 'hello'
console.log(a) // 3
console.log(b.name) // undefined