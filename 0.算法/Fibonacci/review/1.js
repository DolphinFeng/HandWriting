// 递归方法
// 1 1 2 3 5 8 13 21 
function fb (n) {
    if (n === 1 || n === 2) {
        return 1
    }
    return fb(n - 1) + fb(n - 2)
}

console.log(fb(6));