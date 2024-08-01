function start (t) {
    setTimeout(() => {
        t = t - 1000
        if (t > 0) {
            console.log(t);
            start(t)
        }
    }, 1000)
}

start(10000)