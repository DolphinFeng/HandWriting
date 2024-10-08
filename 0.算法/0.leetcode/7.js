// 整数反转

function reverse (x) {
    let res = 0
    while (x) {
        res = res * 10 + x % 10
        if (res > Math.pow(2, 31) - 1 || res < Math.pow(-2, 31)) return 0
        x = ~~(x / 10)
    }
    return res
}

console.log(reverse(123));
console.log(reverse(-123));
console.log(reverse(120));
