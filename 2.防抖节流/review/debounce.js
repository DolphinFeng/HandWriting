function debounce (fn, wait) {
    let timer
    return function () {
        if (timer) clearTimeout(timer)
        timer = setTimeout(() => {
            fn.apply(this, arguments)
        }, wait)
    }
}