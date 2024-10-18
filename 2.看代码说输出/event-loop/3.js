const promise = new Promise((resolve, reject) => {
    console.log(1);
    setTimeout(() => {
        console.log('6');
        setTimeout(() => {
            console.log('8');
        }, 0)
        resolve()
        console.log('7');
    }, 0)
    console.log('2');
})

setTimeout(() => {
    console.log('5');
}, 0)

promise.then((res) => {
    console.log(res);  // 得resolve后才会打印，因此这个微任务在第一个定时器最后打印
})

console.log(4);
// 拿下

// 1 2 4 6 7 undefined 5 8