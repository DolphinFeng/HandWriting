setTimeout(function () {
    console.log(1)
}, 1000)
new Promise(function executor(resolve) {
    console.log(2)
    for (var i = 0; i < 10000; i++) {
        i == 9999 && resolve()
    }
    console.log(3)
}).then(function () {
    console.log(4)
})
console.log(5)

// 主要是循环其实也是同步，这是 v8眼里，虽然我们知道 循环这么多执行就是耗时的操作