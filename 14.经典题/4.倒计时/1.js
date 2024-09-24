/**
 * 启动一个倒计时定时器
 * @param {number} t - 倒计时的初始时间（毫秒）
 */
function start (n) {
    let timer 
    timer = setInterval(() => {
        n = n - 1000
        if (n > 0) console.log(~~(n / 1000));
        if (n <= 0) {
            clearInterval(timer)
        } 
    }, 1000)
}

start(10000)


// https://juejin.cn/post/7343921389084426277