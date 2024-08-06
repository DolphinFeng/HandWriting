/**
 * 启动计时器函数，接受一个初始时间参数 t（以毫秒为单位）。
 * 该函数每秒递减 t 并在控制台输出当前时间。
 * @param {number} t - 初始时间，单位为毫秒
 */
function start (t) {
    /**
     * 内部递归函数，用于每秒递减 t 并输出当前时间。
     */
    function run () {
        // 使用 requestAnimationFrame 确保动画帧的平滑执行
        requestAnimationFrame (() => {
            // 每次递减 1000 毫秒（1 秒）
            t = t - 1000
            // 设置一个 1 秒的延迟后输出当前时间并递归调用 run 函数
            setTimeout(() => {
                console.log(t);
                run()
            }, 1000) 
        }) 
    }
    // 启动递归函数
    run()
}

// 启动计时器，初始时间为 10000 毫秒（10 秒）
start(10000)
