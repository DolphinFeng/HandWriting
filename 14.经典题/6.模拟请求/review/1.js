function simulateRequest (timeout) {
    return new Promise((resolve, reject) => {
        const requestTime = Math.random() * 2000
        setTimeout(() => {
            if (timeout > requestTime) {
                resolve('success')
            } else {
                reject('failed')
            }
        }, timeout)
    })
}

simulateRequest(1000)
    .then(res => {
        console.log(res);
    })
    .catch(err => {
        console.log(err);
    })