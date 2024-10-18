// var arr = []
// for (var i = 0; i < 10; i++) {
//     arr[i] = function () {
//         console.log(i);
//     }
// }

// for (var j = 0; j < arr.length; j++) {
//     arr[j]()
// }

// 这涉及到，作用域链outer指向，执行arr函数时，里面的i沿着outer往外
// 闭包提现：在不使用 var 改成 let 的情况下，正常输出 0 - 9 ，给 i 分别存入 闭包中，每个 a 函数执行完销毁前
// 会看自身的参数是否被内层函数所使用，如果使用，则把参数的值保存到闭包中


var arr = []
for (var i = 0; i < 10; i++) {
    (function a (j) {
        arr[i] = function () {
            console.log(j);
        }
    })(i)
}

for (var k = 0; k < arr.length; k++) {
    arr[k]()
}