function simulateRequest (timeout) {
    return new Promise((resolve, reject) => {
        let requestTime = Math.random() * 2000
        setTimeout(() => {
            if (timeout > requestTime) {
                resolve('success')
            } else {
                reject('failed')
            }
        }, requestTime)
    })
}

simulateRequest(1000)
.then(res => {
    console.log(res);
    
})
.catch(err => {
    console.log(err);
    
})