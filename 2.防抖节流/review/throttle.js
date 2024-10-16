function throttle (fn, wait) {
    let prevTime = Date.now()
    return function () {
        if (Date.now() - prevTime > wait) {
            fn.apply(this, arguments)
            prevTime = Date.now()
        }
    }
}