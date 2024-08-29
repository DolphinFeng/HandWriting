class Sleep {
    constructor (timeout) {
        this.timeout = timeout
    }

    then (resolve) {
        const startTime = Date.now()
        setTimeout(() => {
            resolve(Date.now() - startTime)
        }, this.timeout)
    }
}


(async () => {
    const sleepTime = await new Sleep(1000)
    console.log(sleepTime);
})()