const a = () => {
    Promise.resolve()
    .then(() => {
        console.log(0);
        return Promise.resolve(4)
        // return 4
    }).then((res) => {
        console.log(res);
    })
    Promise.resolve()
    .then(() => {
        console.log(1);
    }).then(() => {
        console.log(2);
    }).then(() => {
        console.log(3);
    }).then(() => {
        console.log(4);
    }).then(() => {
        console.log(5);
    }).then(() => {
        console.log(6);
    }).then(() => {
        console.log(7);
    }).then(() => {
        console.log(8);
    })
}

a() 
// https://stackoverflow.com/questions/70371523/promise-order-invocation
// 这是个bug
// https://mp.weixin.qq.com/s/uqwU4GFOrMs42c_DLeWT9w

// 其实不是bug，这是因为js对于微任务的执行有个优化，
// 对于超过三个then的微任务会进行交叉执行