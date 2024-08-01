Promise.resolve(1)
    .then(
        res => new Promise((resolve, reject) => { resolve(2) })
    )
    .catch(err => {
        console.log(err)
        return 3
    })
    .then((res) => {
        console.log(res)
    })

// let promise = new Promise(resolve => { resolve(1) }) // 没有这个照样执行

// 输出
// 2

// 多个then调用时，then里面的res是上一个then resolve进的值