/**
 * 将生成器函数转换为异步函数
 * @param {Function} generatorFn - 生成器函数
 * @returns {Function} - 返回一个异步函数
 */
function generatorToAsync(generatorFn) {
	const gen = generatorFn() // 初始化生成器
	return function () {
		return new Promise((resolve, reject) => {
			/**
			 * 递归循环处理生成器的每一步
			 * @param {string} key - 生成器方法名（'next' 或 'throw'）
			 * @param {any} arg - 传递给生成器的参数
			 */
			function loop(key, arg) {
				let res = null
				res = gen[key](arg) // 执行生成器方法
				const { value, done } = res // 解构结果对象
				if (done) {
					return resolve(value) // 生成器完成，返回最终值
				} else {
					Promise.resolve(value).then(res => {
						// 处理生成器返回的值，继续下一步
						loop('next', value)
					}).catch(err => {
						// 处理错误情况
						loop('throw', err)
					})
				}
			}
			loop('next') // 开始执行生成器
		})
	}
}
