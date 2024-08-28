// 用setTimeout写setInterval

function customSetInterval(callback, interval) {
    let timerId;

    function repeat() {
        callback();
        timerId = setTimeout(repeat, interval);
    }

    timerId = setTimeout(repeat, interval);

    return {
        clear: function() {
            clearTimeout(timerId);
        }
    };
}

// 示例用法
let counter = 0;
const interval = customSetInterval(() => {
    console.log(`Counter: ${counter}`);
    counter++;
    if (counter >= 5) {
        interval.clear(); // 停止定时器
    }
}, 1000);