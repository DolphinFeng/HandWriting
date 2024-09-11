// 用setTimeout写setInterval

function mySetInterval(callback, interval) {
    function repeat() {
        callback();
        setTimeout(repeat, interval);
    }
    setTimeout(repeat, interval);
}

// 示例使用
mySetInterval(() => {
    console.log('This message is logged every 1 second');
}, 1000);