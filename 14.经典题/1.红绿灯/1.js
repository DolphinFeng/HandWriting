// 定义红灯函数，输出 'red'
function red() {
    console.log('red');
}

// 定义绿灯函数，输出 'green'
function green() {
    console.log('green');
}

// 定义黄灯函数，输出 'yellow'
function yellow() {
    console.log('yellow');
}

/**
 * 定义一个灯光函数，接收一个回调函数和等待时间
 * @param {function} cb - 回调函数，用于输出灯光颜色
 * @param {number} wait - 等待时间，单位为毫秒
 * @returns {Promise} - 返回一个Promise，在等待时间后执行回调函数并resolve
 */
function light(cb, wait) {
    return new Promise((resolve) => {
        setTimeout(() => {
            cb();
            resolve();
        }, wait);
    });
}

/**
 * 定义一个启动灯光循环的函数
 * 使用Promise链式调用依次执行红灯、绿灯、黄灯
 * 在所有灯光执行完毕后，递归调用自身以实现无限循环
 */
function lightStart() {
    Promise.resolve().then(() => {
        return light(red, 1000);
    }).then(() => {
        return light(green, 1000);
    }).then(() => {
        return light(yellow, 1000);
    }).finally(() => {
        return lightStart();
    });
}

// 启动灯光循环
lightStart();
