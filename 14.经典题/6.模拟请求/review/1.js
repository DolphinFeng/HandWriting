function simulateRequest (timeout) {
    return new Promise((resovle, reject) => {
        const requestTime = Math.random() * 2000
        setTimeout(() => {
            if (requestTime < timeout) {
                resovle('success')
            } else {
                reject('failed')
            }
        }, requestTime)
    })
}

simulateRequest(1000)
    .then(res => {
        console.log(res)
    })
    .catch(err => {
        console.log(err)
    })