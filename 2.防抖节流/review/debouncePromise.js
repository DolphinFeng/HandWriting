function debounce(fn, delay) {

    let timer
    let resolveList = []

    return function () {
        return new Promise((resolve, reject) => {
            if (timer) clearTimeout(timer)

            timer = setTimeout(() => {
                Promise.resolve(fn.apply(this, arguments))
                    .then(res => {
                        resolveList.forEach(resolve => resolve(res))
                        resolveList = []
                    })
                    .catch(err => {
                        resolveList.forEach((_, reject) => reject(err))
                        resolveList = []
                    })
            }, delay)

            resolveList.push(resolve)
        })
    }

}