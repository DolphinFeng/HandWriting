function throttlePromise (fn, delay) {
    let lastCall = 0
    let timer
    let resolveList = []
    return function  (...args) {
        return new Promise((resolve, reject) => {
            const now = Date.now()

            const executeFunction = () => {
                Promise.resolve(fn.apply(this, args))
                    .then(result => {
                        resolveList.forEach(res => res(result))
                        resolveList = []
                    })
                    .catch((error) => {
                        resolveList.forEach((_, rej) => rej(error))
                        resolveList = []
                    })
            }

            if (now - lastCall >= delay) {
                lastCall = now
                executeFunction()
            } else {
                if (timer) clearTimeout(timer)
                timer = setTimeout(() => {
                    lastCall = Date.now()
                    executeFunction()
                }, delay - (now - lastCall))
            }

            resolveList.push(resolve)
        })
    }
}