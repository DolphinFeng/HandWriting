// 动归方法

function fb (n) {
    let list = [1, 1]
    for (let i = 2; i < n; i++) {
        list[i] = list[i - 1] + list[i - 2]
    }
    return list[n - 1]
}

console.log(fb(6));