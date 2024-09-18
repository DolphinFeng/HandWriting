class MyPromise{
    constructor (executor) {
        this.value = undefined
        this.reason = undefined
        this.state = 'pending'
        this.onFulfilledCallbacks = []
        this.onRejectedCallbacks = []

        const resolve = (value) => {
            if (this.state === 'pending') {
                this.state = 'fulfilled'
                this.value = value
                this.onFulfilledCallbacks.forEach(cb => cb(value))
            } 
        }
        const reject = (reason) => {
            if (this.state === 'pending') {
                this.state = 'rejected'
                this.reason = reason
                this.onRejectedCallbacks.forEach(cb => cb(reason))
            }
        }

        try {
            executor(resolve, reject)
        } catch (err) {
            reject(err)
        }
    }

    then (onFulfilled, onRejected) {
        onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : value => value
        onRejected = typeof onRejected === 'function' ? onRejected : err => { throw err }
        const newPromise = new MyPromise((resolve, reject) => {
            const resolvePromise = (cb) => {
                Promise.resolve().then(() => {
                    try {
                        const res = cb(this.value || this.reason)
                        if (res instanceof MyPromise) {
                            res.then(resolve, reject)
                        } else {
                            resolve(res)
                        }
                    } catch (err) {
                        reject(err)
                    }
                })
            }

            if (this.state === 'fulfilled') {
                resolvePromise(onFulfilled)
            } else if (this.state === 'rejected') {
                resolvePromise(onRejected)
            } else {
                this.onFulfilledCallbacks.push(() => resolvePromise(onFulfilled))
                this.onRejectedCallbacks.push(() => resolvePromise(onRejected))
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

    static resolve (value) {
        if (value instanceof MyPromise) {
            return value
        }
        return new MyPromise((resolve, reject) => resolve(value))
    }

    static reject (reason) {
        return new MyPromise((_, reject) => {
            reject(reason)
        })
    }

    static race (promises) {
        return new MyPromise((resolve, reject) => {
            for (let promise of promises) {
                promise.then(
                    (value) => resolve(value),
                    (reason) => reject(reason)
                )
            }
        })
    }

    static all (promises) {
        return new MyPromise((resolve, reject) => {
            let res = [], count = 0
            for (let i = 0; i < promises.length; i++) {
                promises[i].then(
                    (value) => {
                        res[i] = value
                        count++
                        if (count === promises.length) {
                            resolve(res)
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
                        arr[i] = reason
                        count++
                        if (count === promises.length) {
                            reject(new AggregateError(arr))
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
                .then(value => {
                    arr[i] = {
                        state: 'fulfilled',
                        value
                    }
                })
                .catch(reason => {
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

function child () {
    return new MyPromise((resolve, reject) => {
        setTimeout(() => {
            console.log('child');
            // resolve('after child')
            reject('child error')
        }, 3000)
    })
}

function teen () {
    return new MyPromise((resolve, reject) => {
        setTimeout(() => {
            console.log('teen');
            resolve('after teen')
            reject('teen error')
        }, 2000)
    })
}

function adult () {
    return new MyPromise((resolve, reject) => {
        setTimeout(() => {
            console.log('adult');
            resolve('after adult')
            // reject('adult error')
        }, 1000)
    })
}

// child()
// .then(res => {
//     console.log(res);
//     return teen()
// })
// .then(res => {
//     console.log(res);
//     return adult()
// })
// .then(res => {
//     console.log(res);
// })
// .finally(() => {
//     console.log('all Promise are settled');
// })

// MyPromise.resolve('success').then(res => {
//     console.log(res);
// })
// MyPromise.reject('error').catch(err => {
//     console.log(err);
// })

// MyPromise.race([child(), teen(), adult()]).then((res) => {
//     console.log(res);
// })

// MyPromise.all([child(), teen(), adult()]).then(res => {
//     console.log(res);
// })

// MyPromise.any([child(), teen(), adult()]).catch(err => {
//     console.log(err);
// })

MyPromise.allSettled([child(), teen(), adult()]).then(res => {
    console.log(res);
})
.catch(err => {
    console.log(err);
})