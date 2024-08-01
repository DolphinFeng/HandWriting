// 模拟一个请求，没超时就是resove，超时则reject
function request () { // 模拟一个2s的请求
    return new Promise(resolve => {
        setTimeout(() => {
            resolve('请求成功') 
        }, 2000)
    })
}

function start (wait) {
    return new Promise((resolve, reject) => {
        request().then(res => {
            resolve(res)
        }).catch(err => {
            reject(err)
        })
        setTimeout(() => { // 模拟请求超时
            reject('请求超时');
        }, wait)
    }) 
}

let delay = 1000 // 真实请求时间，时间比这个长就超时，短则反之

start(delay)
.then(res => {
    console.log(res);
})
.catch(err => {
    console.log(err);
})