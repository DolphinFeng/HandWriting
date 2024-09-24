const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]


arr.reduce((pre, item) => {
    return new Promise((resolve) => {
        return pre.then(() => {
            setTimeout(() => {
                resolve(console.log(item))
            }, 1000)
        })
    })
}, Promise.resolve())