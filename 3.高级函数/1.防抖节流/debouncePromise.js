/**
 * debouncePromise 函数用于创建一个防抖动的函数，该函数返回一个 Promise。
 * 在指定的延迟时间内，如果多次调用该函数，只会执行最后一次调用。
 * 
 * @param {Function} fn - 需要防抖动的函数
 * @param {number} delay - 延迟时间，单位为毫秒
 * @returns {Function} - 返回一个新的防抖动函数
 */
function debouncePromise(fn, delay) {
    let timer; // 定义一个定时器变量
    let resolveList = []; // 存储所有的 resolve 函数

    return function(...args) {
        return new Promise((resolve, reject) => {
            if (timer) clearTimeout(timer); // 如果已有定时器，清除它

            // 设置新的定时器
            timer = setTimeout(() => {
                // 执行传入的函数，并将结果传递给所有的 resolve 函数
                Promise.resolve(fn.apply(this, args))
                    .then(result => {
                        resolveList.forEach(res => res(result)); // 依次调用所有的 resolve 函数
                        resolveList = []; // 清空 resolveList
                    })
                    .catch(error => {
                        resolveList.forEach((_, rej) => rej(error)); // 依次调用所有的 reject 函数
                        resolveList = []; // 清空 resolveList
                    });
            }, delay);

            resolveList.push(resolve); // 将当前的 resolve 函数存入 resolveList
        });
    };
}