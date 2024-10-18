// 如何使用闭包实现打印 0-5
for (var i = 0; i < 5; i++) {
    setTimeout(() => {
        console.log(i);
    })
}

console.log(i++);