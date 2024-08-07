// 模拟一个请求，没超时就是resolve，超时则reject

function simulate (timeout) {
    return new Promise((resolve, reject) => {
        let request = Math.random() * 2000
        setTimeout(() => {
            if (request <= timeout) {
                resolve('请求成功')
            } else {
                reject('请求超时')
            }
        }, request)
    })
}

simulate(1000)
.then(res => {
    console.log(res);
})
.catch(err => {
    console.log(err);
})