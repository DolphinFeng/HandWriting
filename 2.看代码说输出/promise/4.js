const a = new Promise(() => {
    throw new TypeError();
})
a
    .then(() => {
        console.log("success1");
    }, () => {
        console.log("error1");
    })
    .then(() => {
        console.log("success2");
    })
    .catch(() => {
        console.log("error2");
    })

// then一定会返回一个resolve，从源码中就知道
// promise实例返回一个reject，触发下一个then的第二个回调，第一个then执行完后resolve给下一个then执行