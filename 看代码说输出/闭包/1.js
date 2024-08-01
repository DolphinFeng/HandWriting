var arr = []
for (let i = 0; i < 10; i++) {
    arr[i] = function () {
        console.log(i);
    }
}

for (var j = 0; j < arr.length; j++) {
    arr[j]()
}

// 这涉及到，作用域链outer指向，执行arr函数时，里面的i沿着outer往外

// var arr = []
// for (var i = 0; i < 10; i++) {
//     (function a (j) {
//         arr[i] = function () {
//             console.log(j);
//         }
//     })(i)
// }

// for (var k = 0; k < arr.length; k++) {
//     arr[k]()
// }