/**
 * 创建一个节流的Promise函数
 * @param {Function} fn - 需要节流的函数
 * @param {number} delay - 节流的时间间隔（毫秒）
 * @returns {Function} - 返回一个新的函数，该函数在指定的时间间隔内最多执行一次
 */
function throttlePromise(fn, delay) {
    let lastCall = 0; 
    let timer; 
    let resolveList = [];

    return function(...args) {
        return new Promise((resolve, reject) => {
            const now = Date.now(); // 获取当前时间戳

            const executeFunction = () => {
                Promise.resolve(fn.apply(this, args))
                    .then(result => {
                        resolveList.forEach(res => res(result));
                        resolveList = []; // 清空resolveList
                    })
                    .catch(error => {
                        resolveList.forEach((_, rej) => rej(error));
                        resolveList = [];
                    });
            };

            if (now - lastCall >= delay) {
                lastCall = now;
                executeFunction();
            } else {
                if (timer) clearTimeout(timer);
                timer = setTimeout(() => {
                    lastCall = Date.now();
                    executeFunction();
                }, delay - (now - lastCall));
            }

            resolveList.push(resolve);
        });
    };
}
