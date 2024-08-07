class MyPromise {
    constructor (executor) {
        this.value = undefined
        this.reason = undefined
        this.state = 'pending'
        this.onFulfilledCallbacks = []
        this.onRejectedCallbacks = []

        const resolve = (value) => {
            if (this.state === 'pending') {
                this.value = value
                this.state = 'fulfilled'
                this.onFulfilledCallbacks.forEach(cb => cb(value))
            }
        }

        const reject = (reason) => {
            if (this.state === 'pending') {
                this.reason = reason
                this.state = 'rejected'
                this.onRejectedCallbacks.forEach(cb => cb(reason))
            }
        }

        executor(resolve, reject)
    }

    then (onFulfilled, onRejected) {
        onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : value => value
        onRejected = typeof onRejected === 'function' ? onRejected : reason => { throw reason }
        const newPromise = new MyPromise(() => {
            if (this.state === 'fulfilled') {
                setTimeout(() => {
                    try {
                        const res = onFulfilled(this.value)
                        resolve(res)
                    } catch (err) {
                        reject(err)
                    }
                })
            }
            if (this.state === 'rejected') {
                setTimeout(() => {
                    try {
                        const res = onRejected(this.reason)
                        resolve(res)
                    } catch (err) {
                        reject(err)
                    }
                })
            }
            if (this.state === 'pending') {
                this.onFulfilledCallbacks.push((value) => {
                    setTimeout(() => {
                        try {
                            const res = onFulfilled(value)
                            resolve(res)
                        } catch (err) {
                            reject(err)
                        }
                    })
                })
                this.onRejectedCallbacks.push((reason) => {
                    setTimeout(() => {
                        try {
                            const res = onRejected(reason)
                            resolve(res)
                        } catch (err) {
                            reject(err)
                        }
                    })
                })
            }
        })
        return newPromise
    }

    catch (onRejected) {
        return this.then(undefined, onRejected)
    }

    finally (cb) {
        return this.then(
            (value) => {
                return MyPromise.resolve(cb()).then(() => value)
            },
            (reason) => {
                return MyPromise.resolve(cb()).then(() => {
                    throw reason
                })
            }
        )
    }

    static race (promises) {
        return new MyPromise((resolve, reject) => {
            for (let promise of promises) {
                promise.then(
                    (value) => {
                        resolve(value)
                    },
                    (reason) => {
                        reject(reason)
                    }
                )
            }
        })
    }

    static all (promises) {
        return new MyPromise((resolve, reject) => {
            let arr = [], count = 0
            for (let i = 0; i < promises.length; i++) {
                promises[i].then(
                    (value) => {
                        count++
                        arr[i] = value
                        if (count === promises.length) {
                            resolve(arr)
                        }
                    },
                    (reason) => {
                        reject(reason)
                    }
                )
            }
        })
    }

    static any (promises) {
        return new MyPromise((resolve, reject) => {
            let arr = [], count = 0
            for (let i = 0; i < promises.length; i++) {
                promises[i].then(
                    (value) => {
                        resolve(value)
                    },
                    (reason) => {
                        count++
                        arr[i] = reason
                        if (count === promises.length) {
                            reject(new AggregatedError(arr))
                        }
                    }
                )
            }
        })
    }

    static allSettled (promises) {
        return new MyPromise((resolve, reject) => {
            let arr = [], count = 0
            for (let i = 0; i < promises.length; i++) {
                promises[i]
                .then((value) => {
                    arr[i] = {
                        state: 'fulfilled',
                        value
                    }
                })
                .catch((reason) => {
                    arr[i] = {
                        state: 'rejected',
                        reason
                    }
                })
                .finally(() => {
                    count++
                    if (count === promises.length) {
                        resolve(arr)
                    }
                })
            }
        })
    }
}

function xq () {
    return new MyPromise((resolve, reject) => {
        setTimeout(() => {
            resolve('相亲成功')
            console.log('我要相亲了');
        }, 2000)
    })
}

function marry () {
    return new MyPromise((resolve, reject) => {
        setTimeout(() => {
            resolve('结婚成功')
            console.log('我要结婚了');
        }, 1000)
    })
}

function baby () {
    return new MyPromise((resolve, reject) => {
        setTimeout(() => {
            resolve('有孩子了')
            console.log('我要有孩子了');
        }, 500)
    })
}

xq()
.then(res => {
    console.log(res);
    return marry()
})
.then(res => {
    console.log(res);
    baby()
})