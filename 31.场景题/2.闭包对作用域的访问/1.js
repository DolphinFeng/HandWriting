// function createCounter() {
//     // 外部作用域中的变量
//     let count = 0;

//     // 返回一个闭包函数
//     return function() {
//         // 闭包函数可以访问外部作用域中的变量
//         count++;
//         return count;
//     };
// }

// const counter = createCounter();

// // 调用闭包函数
// console.log(counter()); // 输出: 1
// console.log(counter()); // 输出: 2
// console.log(counter()); // 输出: 3



function normalFunction() {
    // 函数内部的局部变量
    let count = 0;
    count++;
    return count;
}

// 调用普通函数
console.log(normalFunction()); // 输出: 1
console.log(normalFunction()); // 输出: 1
console.log(normalFunction()); // 输出: 1