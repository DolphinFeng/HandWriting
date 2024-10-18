// const p1 = new Promise(resolve => {
//     setTimeout(() => {
//         resolve('resolve3')
//         console.log('timer1');
//     }, 0)

//     resolve('resolve1')
//     resolve('resolve2')
// })
//   .then(res => {
//     console.log(res);
//     console.log('p11111', p1); // pending
//     setTimeout(() => {
//         console.log('p1', p1); // undefined    // 因为 then 里面没有返回 Promise 。p 实例后面还有 then ，那么 p 就看 then 返回的状态
//     }, 1000)
//     return res
//   })
//   .finally((res) => {
//     console.log('finally', res);
//   })

const p2 = new Promise(resolve => {
    resolve(1)
}).then(res => {
    console.log(res);
    setTimeout(() => {
        console.log('p2', p2); // p2 Promise { undefined }
    })
    console.log(p2, '//////****');
    return Promise.resolve('222')
})

console.log(p2, '///');


setTimeout(() => {
    console.log('p2', p2); // p2 Promise { undefined }
})


// .then(() => {
//     return Promise.resolve('333')
// })

// p2.then(res => {
//     console.log(res);
//     return Promise.resolve('444')

// })

// setTimeout(() => {
//     console.log('p2', p2); // p2 Promise { '444' }
// })