class MyPromise {
    constructor(executor) {
        this.state = 'pending'  // promise的默认状态
        this.value = undefined  // resolve的参数
        this.reason = undefined  // reject的参数
        this.onFulfilledCallbacks = [] // 存储成功回调
        this.onRejectedCallbacks = []  // 存储失败回调
        
        const resolve = (value) => {
            if (this.state === 'pending') {
                this.state = 'fulfilled'
                this.value = value
                this.onFulfilledCallbacks.forEach(cb => cb(value)) // 执行所有成功回调
            }
        }
        const reject = (reason) => {
            if (this.state === 'pending') {
                this.state = 'rejected'
                this.reason = reason
                this.onRejectedCallbacks.forEach(cb => cb(reason)) // 执行所有失败回调
            }
        }
        executor(resolve, reject) // 执行传入的executor函数
    }

    then(onFulfilled, onRejected) {
        onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : value => value
        onRejected = typeof onRejected === 'function' ? onRejected : reason => { throw reason }
        const newPromise = new MyPromise((resolve, reject) => {
            if (this.state === 'fulfilled') {
                setTimeout(() => { // 模拟异步微任务
                    try {
                        const result = onFulfilled(this.value)
                        resolve(result) // 处理成功回调的返回值
                    } catch (error) {
                        reject(error) // 捕获并处理错误
                    }
                })
            }
            if (this.state === 'rejected') {
                setTimeout(() => {
                    try {
                        const result = onRejected(this.reason)
                        resolve(result) // 处理失败回调的返回值
                    } catch (error) {
                        reject(error) // 捕获并处理错误
                    }
                })
            }
            if (this.state === 'pending') { // 缓存then中的回调
                this.onFulfilledCallbacks.push((value) => {
                    setTimeout(() => { // 确保异步执行
                        try {
                            const result = onFulfilled(value)
                            resolve(result)
                        } catch (error) {
                            reject(error)
                        }
                    })
                })
                this.onRejectedCallbacks.push((reason) => {
                    setTimeout(() => { // 确保异步执行
                        try {
                            const result = onRejected(reason)
                            resolve(result)
                        } catch (error) {
                            reject(error)
                        }
                    })
                })
            }
        })
        return newPromise
    }

    catch(onRejected) {
        return this.then(undefined, onRejected) // 只处理失败情况
    }

    static race(promises) { // 接收一个promise数组
        return new MyPromise((resolve, reject) => {
            for (let promise of promises) {
                promise.then( // 处理第一个完成的promise
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

    static all(promises) { // 接收一个promise数组
        return new MyPromise((resolve, reject) => {
            let count = 0, arr = []
            for (let i = 0; i < promises.length; i++) {
                promises[i].then(
                    (value) => {
                        count++
                        arr[i] = value
                        if (count === promises.length) {
                            resolve(arr) // 所有promise都成功时resolve
                        }
                    },
                    (reason) => {
                        reject(reason) // 任何一个promise失败时reject
                    }
                )
            }
        })
    }

    static any(promises) { // 接收一个promise数组
        return new MyPromise((resolve, reject) => {
            let count = 0, errors = []
            for (let i = 0; i < promises.length; i++) {
                promises[i].then(
                    (value) => {
                        resolve(value) // 任何一个promise成功时resolve
                    },
                    (reason) => {
                        count++
                        errors[i] = reason
                        if (count === promises.length) {
                            reject(new AggregateError(errors)) // 所有promise都失败时reject
                        }
                    }
                )
            }
        })
    }

    finally(cb) {
        return this.then(
            (value) => {
                return MyPromise.resolve(cb()).then(() => value) // 执行回调后继续传递成功值
            },
            (reason) => {
                return MyPromise.resolve(cb()).then(() => {
                    throw reason // 执行回调后继续传递失败原因
                })
            }
        )
    }

    static allSettled(promises) { // 接收一个promise数组
        return new Promise((resolve) => {
            let res = []
            let count = 0

            function checkSettled () {
                if (count === promises.length) {
                    resolve(res) // 所有promise都settled时resolve
                }
            }

            for(let i = 0; i < promises.length; i++) {
                promises[i]
                .then((value) => {
                    res[i] = { status: 'fulfilled', value } // 记录成功结果
                })
                .catch((reason) => {
                    res[i] = { status: 'rejected', reason } // 记录失败结果
                })    
                .finally(() => {
                    count++
                    checkSettled() // 检查是否所有promise都settled
                })
            }
        })
    }
}