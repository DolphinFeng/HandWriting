// 204. 计数质数
var countPrimes = function(n) {
    let res = []
    for (let i = 2; i < n; i++) {
        if (isPrime(i)) {
            res.push(i)
        }
    }

    function isPrime (num) {
        if (num <= 1) return false
        if (num <= 3) return true
        if (num % 2 === 0 || num % 3 === 0) return false
        for (let i = 5; i * i <= num; i += 6) {
            if (num % i === 0 || num % (i + 2) === 0) return false
        }
        return true
    }

    return res.length
};

console.log(countPrimes(10)); // 4