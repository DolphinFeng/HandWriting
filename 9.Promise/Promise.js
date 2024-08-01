class MyPromise {
	constructor(executor) {
		this.state = 'pending'  // promise的默认状态
		this.value = undefined  // resolve的参数
		this.reason = undefined  // reject的参数
		this.onFulfilledCallbacks = [] // 多个回调用数组来装
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
		executor(resolve, reject)
	}
	then(onFulfilled, onRejected) {
		onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : value => value
		onRejected = typeof onRejected === 'function' ? onRejected : reason => { throw reason }
		const newPromise = new MyPromise((resolve, reject) => {
			if (this.state === 'fulfilled') {
				setTimeout(() => { // 模拟异步微任务
					try {
						const result = onFulfilled(this.value)
						resolve(result) // 应该放result中的resolve中的参数
					} catch (error) {
						reject(error)
					}
				})
			}
			if (this.state === 'rejected') {
				setTimeout(() => {
					try {
						const result = onRejected(this.reason)
						resolve(result)
					} catch (error) {
						reject(error)
					}
				})
			}
			if (this.state === 'pending') { // 缓存then中的回调
				this.onFulfilledCallbacks.push((value) => {
					setTimeout(() => { // 保障将来onFulfilled在resolve中被调用时是个异步函数
						try {
							const result = onFulfilled(value)
							resolve(result)
						} catch (error) {
							reject(error)
						}
					})
				})
				this.onRejectedCallbacks.push((reason) => {
					setTimeout(() => { // 保障将来onFulfilled在resolve中被调用时是个异步函数
						try {
							const result = onFulfilled(reason)
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
		return this.then(undefined, onRejected)
	}
    static race(promises) { // 接收数组
		return new MyPromise((resolve, reject) => {
			// 判断数组中谁的状态先变更
			for (let promise of promises) {
				promise.then( // 能走这个逻辑一定是个promise对象，因此不用判断
					(value) => {
						resolve(value)
					},
					(reason) => { // 谁先reject，就用谁
						reject(reason)
					}
				)
			}
		})
	}
    static all(promises) {
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
					(reason) => { // 但凡有一个走这个回调，那么all就rejected
						reject(reason)
					}
				)
			}
		})
	}
    static any(promises) {
		return new MyPromise((resolve, reject) => {
			let count = 0, errors = []
			for (let i = 0; i < promises.length; i++) {
				promises[i].then(
					(value) => {
						resolve(value)
					},
					(reason) => { 
						count++
						errors[i] = reason
						if (count === promises.length) {
							reject(new AggregateError(errors))
						}
					}
				)
			}
		})
	}
	finally(cb) {
		return this.then(
			(value) => {
				return Promise.resolve(cb()).then(() => value)
			},
			(reason) => {
				return Promise.resolve(cb()).then(() => {
					throw reason
				})
			}
		)
	}
	static allSettled(promises) {
		return new Promise((resolve) => {
			let res = []
			let count = 0

			function checkSettled () {
				if (count === promises.length) {
					resolve(res)
				}
			}

			for(let i = 0; i < promises.lenght; i++) {
				promises[i]
				.then((value) => {
					res[i] = { status: 'fulfilled', value }
				})
				.catch((reason) => {
					res[i] = { status: 'rejected', reason }
				})	
				.finally(() => {
					count++
					checkSettled()
				})
			}
		})
	}
}