// 字节一面

// 123456789101112131415……
// 第 n 位字符是什么数字

// eg. n = 5, res = '0'

function findNthDigit(n) {
    // 确定数字的位数
    let digitLength = 1;
    let count = 9;
    let start = 1;

    while (n > digitLength * count) {
        n -= digitLength * count;
        digitLength++;
        count *= 10;
        start *= 10;
    }

    // 确定具体的数字
    let num = start + Math.floor((n - 1) / digitLength);

    // 确定具体的字符
    let numStr = num.toString();
    let digitIndex = (n - 1) % digitLength;

    return numStr[digitIndex];
}

// 测试代码
console.log(findNthDigit(5));  // 输出: '5'
console.log(findNthDigit(11)); // 输出: '0'
console.log(findNthDigit(15)); // 输出: '2'
console.log(findNthDigit(19)); // 输出: '4'