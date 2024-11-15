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
                this.onFulfilledCallbacks.forEach(cb => cb(this.value))
            }
        }

        const reject = (reason) => {
            if (this.state === 'pending') {
                this.state = 'rejected'
                this.reason = reason
                this.onRejectedCallbacks.forEach(cb => cb(this.reason))
            }
        }

        try {
            executor(resolve, reject)
        } catch (error) {
            reject(error)
        }
    }

    then (onFulfilled, onRejected) {
        onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : value => value
        onRejected = typeof onRejected === 'function' ? onRejected : reason => reason
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

                if (this.state === 'fulfilled') {
                    resolvePromise(onFulfilled)
                } else if (this.state === 'rejected') {
                    resolvePromise(onRejected)
                } else if (this.state === 'pending') {
                    this.onFulfilledCallbacks.push(() => resolvePromise(onFulfilled))
                    this.onRejectedCallbacks.push(() => resolvePromise(onRejected))
                }
            }
        })

        return newPromise
    }

    catch (onRejected) {
        return this.then(undefined, onRejected)
    }

    static resolve (value) {
        if (value instanceof MyPromise) {
            return value
        }
        return new MyPromies((resolve) => resolve(value))
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

    static all (promises) {
        return new MyPromise((resolve, reject) => {
            let res = [], count = 0
            for (let i = 0; i < promises.length; i++) {
                promises[i].then(
                    value => {
                        res[i] = value
                        count++
                        if (count === promises.length) {
                            resolve(res)
                        }
                    },
                    reason => reject(reason)
                )
            }
        })
    }

    static any (promises) {
        return new MyPromise((resolve, reject) => {
            let res = [], count = 0
            for (let i = 0; i < promises.length; i++) {
                promises[i].then(
                    value => resolve(value),
                    reason => {
                        res[i] = reason
                        count++
                        if (count === promises.length) {
                            reject(new AggregateError(res))
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