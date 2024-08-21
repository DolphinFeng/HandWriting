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

        // try {
            executor(resolve, reject)
        // } catch (err) {
        //     reject(err)
        // }

    }

    then(onFulfilled, onRejected) {
        onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : value => value
        onRejected = typeof onRejected === 'function' ? onRejected : reason => { throw reason }
        const newPromise = new MyPromise((resolve, reject) => {
            // if (this.state === 'fulfilled') {
            //     setTimeout(() => {
            //         try {
            //             const res = onFulfilled(this.value)
            //             resolve(res)
            //         } catch (err) {
            //             reject(err)
            //         }
            //     })
            // }
            // if (this.state === 'rejected') {
            //     setTimeout(() => {
            //         try {
            //             const res = onRejected(this.reason)
            //             reject(res)
            //         } catch (err) {
            //             reject(err)
            //         }
            //     })
            // }
            // if (this.state === 'pending') {
            //     this.onFulfilledCallbacks.push((value) => {
            //         setTimeout(() => {
            //             try {
            //                 const res = onFulfilled(value)
            //                 resolve(res)
            //             } catch (err) {
            //                 reject(err)
            //             }
            //         })
            //     })
            //     this.onRejectedCallbacks.push((reason) => {
            //         setTimeout(() => {
            //             try {
            //                 const res = onRejected(reason)
            //                 resolve(res)
            //             } catch (err) {
            //                 reject(err)
            //             }
            //         })
            //     })
            // }

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
                return MyPromise.resolve(cb()).then(() => {
                    throw reason
                })
            }
        )
    }

    static resolve(value) {
        if (value instanceof MyPromise) {
            return value
        }
        return new MyPromise((resolve) => resolve(value))
    }

    static reject(reason) {
        return new MyPromise((_, reject) => reject(reason))
    }

    static race (promises) {
        return new MyPromise((resolve, reject) => {
            for (const promise of promises) {
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
            let count = 0, arr = []
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
            reject('after child')
        }, 3000)
    })
}

function teen () {
    return new MyPromise((resolve, reject) => {
        setTimeout(() => {
            console.log('teen');
            // resolve('after teen')
            reject('after teen')
        }, 2000)
    })
}

function adult () {
    return new MyPromise((resolve, reject) => {
        setTimeout(() => {
            console.log('adult');
            // resolve('after adult')
            reject('after adult')
        }, 1000)
    })
}

// child()
// teen()
// adult()

// async 需要手动捕获错误
// async function grow () {
//     // await child()
//     // await teen()
//     // await adult()
//     try {
//         console.time();
//         const res1 = await child()
//         console.log(res1);
//         console.log('1');
        
        
//         // const res2 = await teen()
//         // console.log(res2);
//         console.log('2');
        

//         const res3 = await adult()
//         console.log(res3);
//         console.log('3');
        
//         console.timeEnd();
        
//     } catch (err) {
//         console.log(err);
        
//     }
// }

// grow()

// child()
// .then(res => {
//     console.log(res);
//     return teen()
// })
// .then(1) // 值穿透：当传入的 不是函数，就会发生穿透
// .then(res => {
//     console.log(res);
//     return adult()
// })
// .then(res => {
//     console.log(res);
    
// })
// .finally((res) => { // 不接受参数
//     console.log('all Promise are settled', res);
    
// })

// MyPromise.resolve('success')
// .then(res => {
//     console.log(res);
    
// })

// console.time()
// MyPromise.race([child(), teen(), adult()]) // 函数都会执行，比谁快
// .then(res => { // race 的 then 中仅接受最快的返回结果，无论 resolve，reject
//     console.log(res);
//     console.timeEnd()
// })


// MyPromise.all([adult(), teen(), child()]) // 函数都会并行执行
// .then(res => {
//     console.log(res); // 所有的 resolve 结果按照 all 的顺序放到数组中
    
// })

// MyPromise.any([child(), teen(), adult()])
// .then(res => {
//     console.log(res);
    
// })
// .catch(err => {
//     console.log(err);
    
// })

MyPromise.allSettled([child(), teen(), adult()])
.then(res => {
    console.log(res);
    
})



