/**
 * 创建一个节流的Promise函数
 * @param {Function} fn - 需要节流的函数
 * @param {number} delay - 节流的时间间隔（毫秒）
 * @returns {Function} - 返回一个新的函数，该函数在指定的时间间隔内最多执行一次
 */
function throttlePromise(fn, delay) {
    let lastCall = 0; // 记录上次调用的时间戳
    let timer; // 定时器，用于延迟执行
    let resolveList = []; // 存储Promise的resolve函数

    return function(...args) {
        return new Promise((resolve, reject) => {
            const now = Date.now(); // 获取当前时间戳

            // 执行传入的函数并处理其返回的Promise
            const executeFunction = () => {
                Promise.resolve(fn.apply(this, args))
                    .then(result => {
                        // 成功时，调用所有存储的resolve函数
                        resolveList.forEach(res => res(result));
                        resolveList = []; // 清空resolveList
                    })
                    .catch(error => {
                        // 失败时，调用所有存储的reject函数
                        resolveList.forEach((_, rej) => rej(error));
                        resolveList = []; // 清空resolveList
                    });
            };

            if (now - lastCall >= delay) {
                // 如果距离上次调用的时间超过了delay，立即执行函数
                lastCall = now;
                executeFunction();
            } else {
                // 否则，设置一个定时器在剩余时间后执行函数
                if (timer) clearTimeout(timer);
                timer = setTimeout(() => {
                    lastCall = Date.now();
                    executeFunction();
                }, delay - (now - lastCall));
            }

            // 将当前Promise的resolve函数存储到resolveList中
            resolveList.push(resolve);
        });
    };
}
