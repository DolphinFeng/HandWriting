function debounce (fn, wait) {
    let timer 
    return function () {
        let args = arguments
        if (timer) clearTimeout(timer)
        timer = setTimeout(() => {
            fn.call(this, ...args)
        }, wait)
    }
}