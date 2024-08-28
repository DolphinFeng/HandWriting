// 高德前端一面

// 一直输出 5 然后 Maximum call stack size exceeded

var length = 5;
function a() {
    console.log(this.length);
    function b(fn) {
        fn();
        arguments[0]();
    }
    b(a, 1);
}
a();

// var length = 5;
// function a() {
//     try {
//         console.log(this.length);
//         function b(fn) {
//             fn();
//             arguments[0]();
//         }
//         b(a, 1);
//     } catch (error) {
//         console.error("Error caught: ", error.message);
//     }
// }
// a();
