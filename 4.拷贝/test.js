// let obj = {
//     a: {
//         b: 1
//     }
// }

// function deepCopy(obj) {
//     return new Promise((resolve) => {
//         const { port1, port2 } = new MessageChannel() // 对象解构的key不能乱写
//         port1.postMessage(obj) // 喊话obj

//         obj.a.b = 2
    
//         port2.onmessage = function (msg) { // msg就是port1喊话的内容
//             resolve(msg.data) // msg被包裹了一层data
//         }
//     })
// }

// async function fn () {
//     let objCopy = await deepCopy(obj)
//     console.log(objCopy);
// }

// fn()

// 浅拷贝
// let obj = { a: 1, b: { c: 2 } };

// let obj2 = { ...obj };

// obj2.a = 3;
// obj2.b.c = 4;

// console.log(obj); // {a:1, b: { c: 4 }}
// console.log(obj2); // {a: 3, b: { c: 4 }}



