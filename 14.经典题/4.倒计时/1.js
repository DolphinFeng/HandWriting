/**
 * 启动一个倒计时定时器
 * @param {number} t - 倒计时的初始时间（毫秒）
 */
function start (t) {
    let timer 
    // 设置一个定时器，每隔1秒执行一次
    timer = setInterval(() => {
        // 每次减少1000毫秒（1秒）
        t = t - 1000
        // 如果倒计时还未结束，打印剩余时间
        if (t > 0) {
            console.log(t);
        } else {
            // 倒计时结束，清除定时器
            clearInterval(timer)
        }
    }, 1000)
}

// 启动一个10秒的倒计时
start(10000)


// https://juejin.cn/post/7343921389084426277