// 模拟一个请求，没超时就是resolve，超时则reject


function simulate (timeout) {
    return new Promise((resolve, reject) => {
        let requestTime = Math.random() * 2000
        setTimeout(() => {
            if (requestTime <= timeout) {
                resolve('success')
            } else {
                reject('fail')
            }
        }, requestTime)
    })
}

simulate(1000)
.then(res => {
    console.log(res);
    
})
.catch(err => {
    console.log(err);
    
})