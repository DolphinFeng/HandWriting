// 整数反转

function reverse (num) {
    let res = 0
    while (num) {
        res = res * 10 + num % 10
        if (num > (Math.pow(2, 32) - 1) || num < (Math.pow(-2, 31))) return 0
        num = ~~(num / 10)
    }
    return res
}

console.log(reverse(123));
console.log(reverse(-123));
console.log(reverse(120));


