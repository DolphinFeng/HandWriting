function request() {
    return new Promise((resolve, reject) => {
        setTimeout(() => { // 模拟一个2s的请求
            resolve('请求成功')
        }, 2000)
    })
}

function start (wait) {
    return new Promise((resolve, reject) => {
        request()
        .then((res) => {
            resolve(res)
        })
        .catch((err) => {
            reject(err)
        })
        setTimeout(() => {
            reject('请求超时')
        }, wait)
    })
}

let delay = 3000  // 超过3s就超时

start(delay)
.then(res => {
    console.log(res);
})
.catch(err => {
    console.log(err);
})