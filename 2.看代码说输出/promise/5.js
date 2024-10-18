console.log('1');

setTimeout(() => {
    console.log('2');
}, 0)

Promise.resolve().then(() => {
    console.log('3');
})

new Promise((resolve) => {
    console.log('4');
    resolve()
    console.log('5');
}).then(() => {
    console.log('6');
})

new Promise((resolve) => {
    setTimeout(() => {
        resolve()
    }, 100)
}).then(() => {
    console.log('7');
})

//  1 4 5 3 6 2 7 
// 100ms后将then推入到微任务，就相当于宏任务