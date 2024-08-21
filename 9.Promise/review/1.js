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
        // try {
        //     executor(resolve, reject)
        // } catch (err) {
        //     reject(err)
        // }
    }

    then (onFulfilled, onRejected) {
        onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : value => value
        onRejected = typeof onRejected === 'function' ? onRejected : reason => { throw reason }

        // // 这个版本没有对 res 进行判断是否还是 MyPromise 类型，以及 用的 宏任务代替了微任务
        // const newPromise = new MyPromise((resolve, reject) => {
        //     if (this.state === 'fulfilled') {
        //         setTimeout(() => {
        //             try {
        //                 const res = onFulfilled(this.value)
        //                 resolve(res)
        //             } catch (err) {
        //                 reject(err)
        //             }
        //         })
        //     }
        //     if (this.state === 'rejected') {
        //         setTimeout(() => {
        //             try {
        //                 const res = onRejected(this.reason)
        //                 resolve(res)
        //             } catch (err) {
        //                 reject(err)
        //             }
        //         })
        //     }

        //     if (this.state === 'pending') {
        //         this.onFulfilledCallbacks.push(value => {
        //             setTimeout(() => {
        //                 try {
        //                     const res = onFulfilled(value)
        //                     resolve(res)
        //                 } catch (err) {
        //                     reject(err)
        //                 }
        //             })
        //         })
        //         this.onRejectedCallbacks.push(reason => {
        //             setTimeout(() => {
        //                 try {
        //                     const res = onRejected(reason)
        //                     resolve(res)
        //                 } catch (err) {
        //                     reject(err)
        //                 }
        //             })
        //         })
        //     }
        // })
        // return newPromise
        const newPromise = new MyPromise((resolve, reject) => {
            const resolvePromise = (cb) => {
                Promise.resolve().then(() => {
                    try {
                        const res = cb(this.value || this.reason);
                        if (res instanceof MyPromise) {
                            res.then(resolve, reject);
                        } else {
                            resolve(res);
                        }
                    } catch (err) {
                        reject(err);
                    }
                });
            };

            if (this.state === 'fulfilled') {
                resolvePromise(onFulfilled);
            } else if (this.state === 'rejected') {
                resolvePromise(onRejected);
            } else if (this.state === 'pending') {
                this.onFulfilledCallbacks.push(() => resolvePromise(onFulfilled));
                this.onRejectedCallbacks.push(() => resolvePromise(onRejected));
            }
        });

        return newPromise;
    }

    catch (onRejected) {
        return this.then(undefined, onRejected)
    }

    finally (cb) {
        return this.then(
            (value) => {
                return new MyPromise.resolve(cb()).then(() => value)
            },
            (reason) => {
                return new MyPromise.resolve(cb()).then(() => {
                    throw reason
                })
            }
        )
    }

    static resolve(value) {
        if (value instanceof MyPromise) {
            return value;
        }
        return new MyPromise((resolve) => resolve(value));
    }

    static reject(reason) {
        return new MyPromise((_, reject) => reject(reason)); // resolve 参数被忽略（用 _ 表示）
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
            // resolve('after child')
            reject('after child')
        }, 3000)
    })
}

function teen () {
    return new MyPromise((resolve, reject) => {
        setTimeout(() => {
            // resolve('after teen')
            reject('after teen')
        }, 2000)
    })
}

function adult () {
    return new MyPromise((resolve, reject) => {
        setTimeout(() => {
            // resolve('after adult')
            reject('after adult')
        }, 1000)
    })
}

// // 测试 then，catch，finally
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
// .catch(err => {
//     console.log(err);
    
// })
// .finally(() => {
//     console.log('All MyPromise are settled (resolved / rejected)');
    
// })

// // 测试 resolve
// MyPromise.resolve('success')
// .then(res => {
//     console.log(res);
//     return child()
// })
// .then(res => {
//     console.log(res);
    
// })

// // 测试 reject
// MyPromise.reject('error')
// .catch(err => {
//     console.log(err);
//     return adult()
// }) 
// .catch(err => {
//     console.log(err);
    
// })

// // 测试 race
// MyPromise.race([child(), teen(), adult()])
// .then(res => {
//     console.log(res);
    
// })
// .catch(err => {
//     console.log(err);
    
// })

// // 测试 all
// MyPromise.all([child(), teen(), adult()])
// .then(res => {
//     console.log(res);
    
// })
// .catch(err => {
//     console.log(err);
    
// })

// // 测试 any
MyPromise.any([child(), teen(), adult()])
.then(res => {
    console.log(res);
    
})
.catch(err => {
    console.log(err);
    
})

// // 测试 allSettled
// MyPromise.allSettled([child(), teen(), adult()])
// .then(res => {
//     console.log(res);
    
// })