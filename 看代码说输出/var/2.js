var a = 1
function a(){}
console.log(a)

// a在编译时最后被赋值成了函数体，但是运行时，a又被赋值为了1，因此最后打印1