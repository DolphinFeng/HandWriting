/**
 * 节流函数：限制函数在一定时间间隔内只能执行一次
 * @param {Function} fn - 需要节流的函数
 * @param {number} delay - 时间间隔，单位为毫秒
 * @returns {Function} - 返回一个新的节流函数
 */
function throttle(fn, delay) {
    // 记录上一次函数执行的时间
    let prevTime = Date.now();
    
    // 返回一个新的函数，用于控制函数执行频率
    return function() {
        // 获取当前时间
        if (Date.now() - prevTime > delay) {
            // 如果当前时间与上一次执行时间的间隔大于设定的延迟时间，则执行函数
            fn.apply(this, arguments);
            // 更新上一次执行时间为当前时间
            prevTime = Date.now();
        }
    }
}
