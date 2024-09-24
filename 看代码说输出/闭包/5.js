// 字节一面

// 下面输出什么

// function foo () {
//     console.log('foo');
//     foo()
// }

// foo() // 会爆栈


// function foo () {
//     setTimeout(() => {
//         console.log('setTiemout');
//         foo()
//     }, 0)
// }

// foo() // 不会爆栈是因为：setTimeout 执行其实是推入 任务队列，而不是直接就在 调用栈中执行

// function foo () {
//     Promise.resolve().then(() => {
//         console.log('promise');
//         foo()
//     })
// }

// foo() // 不会爆栈同理