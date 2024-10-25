class MyPromise {
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
        onRejected = typeof onRejected === 'function' ? onRejected : reason => { throw reason }
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
            } else if (this.state === 'pending') {
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
            value => MyPromise.resolve(cb()).then(() => value),
            reason => MyPromise.resolve(cb()).then(() => { throw reason })
        )
    }

    static resolve (value) {
        if (value instanceof MyPromise) {
            return value
        }
        return new MyPromise(resolve => resolve(value))
    }

    static reject (reason) {
        return new MyPromise((_, reject) => reject(reason))
    }

    static race (promises) {
        return new MyPromise((resolve, reject) => {
            for (let promise of promises) {
                promise.then(
                    value => resolve(value),
                    reason => reject(reason)
                )
            }
        })
    }

    // static all (promises) {
    //     return new MyPromise((resolve, reject) => {
    //         let res = [], count = 0
    //         for (let i = 0; i < promises.lenght; i++) {
    //             promises[i].then(
    //                 value => {
    //                     count++
    //                     res[i] = value
    //                     if (count === promises.length) {
    //                         resolve(res)
    //                     }
    //                 },
    //                 reason => reject(reason)
    //             )
    //         }
    //     })
    // }
    static all (promises) {
        return new MyPromise((resolve, reject) => {
            let arr = [], count = 0
            for (let i = 0; i < promises.length; i++) {
                promises[i]
                .then(
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
                            reject(new AggregateError(arr))
                        }
                    }
                )
            }
        })
    }

    static allSettled (promises) {
        return new MyPromise((resolve, reject) => {
            let res = [], count = 0
            for (let i = 0; i < promises.length; i++) {
                promises[i]
                    .then(value => {
                        res[i] = {
                            state: 'fulfilled',
                            value
                        }
                    })
                    .catch(reason => {
                        res[i] = {
                            state: 'rejected',
                            reason
                        }
                    })
                    .finally(() => {
                        count++
                        if (count === promises.length) {
                            resolve(res)
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
            reject('after child err')
        }, 3000)
    })
}

function teen () {
    return new MyPromise((resolve, reject) => {
        setTimeout(() => {
            console.log('teen');
            // resolve('after teen')
            reject('after teen err')
        }, 2000)
    })
}

function adult () {
    return new MyPromise((resolve, reject) => {
        setTimeout(() => {
            console.log('adult')
            // resolve('after adult')
            reject('after adult err')
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
//     console.log('finally');
    
// })

// MyPromise.resolve('success').then(res => {
//     console.log(res);
// })

// MyPromise.reject('err').catch(err => {
//     console.log(err);
// })

// MyPromise.race([child(), teen(), adult()]).then(res => {
//     console.log(res);
// })
// .catch(err => {
//     console.log(err);
// })

// MyPromise.all([child(), teen(), adult()]).then(res => {
//     console.log(res);
// })
// .catch(err => {
//     console.log(err);
// })

MyPromise.any([child(), teen(), adult()]).then(res => {
    console.log(res);
})
.catch(err => {
    console.log(err);
})
// MyPromise.allSettled([child(), teen(), adult()]).then(res => {
//     console.log(res)
// })