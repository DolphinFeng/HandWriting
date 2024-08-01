function start (t) {
    let timer 
    timer = setInterval(() => {
        t = t - 1000
        if (t > 0) {
            console.log(t);
        } else {
            clearInterval(timer)
        }
    }, 1000)
}

start(10000)

// https://juejin.cn/post/7343921389084426277