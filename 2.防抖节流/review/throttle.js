function throttle (fn, delay) {
    let prevTime = Date.now()
    return function () {
        if (Date.now() - prevTime > delay) {
            fn.apply(this, arguments)
            prevTime = Date.now()
        }
    }
}