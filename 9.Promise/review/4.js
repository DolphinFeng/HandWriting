class MyPromise {
    constructor (executor) {
        this.state = 'pending'
        this.value = undefined
        this.reason = undefined
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
            (value) => {
                return MyPromise.resolve(cb()).then(() => value)
            }, 
            (reason) => {
                return MyPromise.resolve(cb()).then(() => { throw reason })
            }
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
            promises.forEach((promise) => {
                promise.then(
                    value => resolve(value),
                    reason => reject(reason)
                )
            })
        })
    }

    static all (promises) {
        return new MyPromise((resolve, reject) => {
            let count = 0, arr = []
            for (let i = 0; i < promises.length; i++) {
                promises[i].then(
                    value => {
                        count++
                        arr[i] = value
                        if (count === promises.length) {
                            resolve(arr)
                        }
                    },
                    reason => {
                        reject(reason)
                    }
                )
            }
        })
    }

    static any (promises) {
        return new MyPromise((resolve, reject) => {
            let count = 0, arr = []

            for (let i = 0; i < promises.length; i++) {
                promises[i].then(
                    value => resolve(value),
                    reason => {
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
            let count = 0, arr = []
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