Promise.resolve(1)
    .then(
        res => {
            new Promise((resolve, reject) => { resolve(2) })
        }
    ).catch(err => {
        console.log(err)
        return 3
    }).then((res) => {
        console.log(res)
    })

let promise = new Promise((resolve, reject) => {
    setTimeout(() => {
        console.log('111111111111')
        resolve(1)
    }, 1000)
})
promise
    .then((res) => {
        console.log(res);
    })
    .then((res) => {
        console.log(res);
    })

Promise.reject(1).then(
    res => { new Promise((resolve, reject) => { reject(2) }) },
    res => { return 3 }
).catch((err) => {
    console.log(err)
})

// 不懂