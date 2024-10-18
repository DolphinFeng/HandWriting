/**
 * 防抖函数：在指定的延迟时间内，如果再次调用该函数，则重新计时。
 * 只有在延迟时间内没有再次调用该函数，才会执行传入的函数。
 * 
 * @param {Function} fn - 需要防抖处理的函数
 * @param {number} delay - 延迟时间，单位为毫秒
 * @returns {Function} - 返回一个防抖处理后的函数
 */
function debounce(fn, delay) {
    let timer // 定义一个定时器变量
    return function() {
        let args = arguments // 获取传入的参数
        if (timer) clearTimeout(timer) // 如果定时器存在，清除定时器
        timer = setTimeout(() => {
            fn.call(this, ...args) // 在延迟时间后执行传入的函数，并传入参数
        }, delay)
    }
}
