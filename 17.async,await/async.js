function generatorToAsync(generatorFn) {
	const gen = generatorFn()
	return function () {
		return new Promise((resolve, reject) => {
			function loop (key, arg) {
				let res = null
				res = gen[key](arg)
				const { value, done } = res
				if (done) {
					return resolve(value)
				} else {
					Promise.resolve(value).then(res => { // promise直接交给resolve得话，promise中resolve的值会传过来
						loop('next', value)
					})
				}
			}
			loop('next')
		})
	}
}