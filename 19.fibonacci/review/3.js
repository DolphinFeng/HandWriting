// 解构方法

function fb (n) {
    let a = 1, b = 1
    for (let i = 3; i <= n; i++) {
        [a, b] = [b, a + b]
    }
    return b
}

console.log(fb(6));