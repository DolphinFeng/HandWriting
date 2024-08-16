function debounce (cb, wait) {
    let timer
    return function () {
        if (timer) clearTimeout(timer)
        timer = setTimeout(() => {
            cb.apply(this, arguments)
        }, wait)
    }
}