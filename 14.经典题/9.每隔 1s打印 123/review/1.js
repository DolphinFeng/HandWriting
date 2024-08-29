const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

arr.reduce((pre, item) => {
    return pre.then(() => {
        return new Promise((r) => {
            setTimeout(() => {
                r(console.log(item))
            }, 1000)
        })
    })
}, Promise.resolve())