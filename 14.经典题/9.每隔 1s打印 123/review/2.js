Promise.resolve()
.then(() => {
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log(1)
            resolve()
        }, 1000)
    })
})
.then(() => {
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log(2)
            resolve()
        }, 1000)
    })
})
.then(() => {
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log(3)
            resolve()
        }, 1000)
    })
})