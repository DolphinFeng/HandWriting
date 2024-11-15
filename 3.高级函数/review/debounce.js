function deboucePromise (fn, delay) {
    let timer
    let resolveList = []
    return function (...args) {
        return new Promise((resolve, reject) => {
            if (timer) clearTimeout(timer)
                
            timer = setTimeout(() => {
                Promise.resolve(fn.apply(this, args))
                    .then(result => {
                        resolveList.forEach(res => res(result))
                        resolveList = []
                    })
                    .catch(error => {
                        resolveList.forEach((_, rej) => rej(error))
                        resolveList = []
                    })
            }, delay)

            resolveList.push(resolve)
        })
    }
}