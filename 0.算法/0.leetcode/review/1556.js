// let num = 123456789

// function getThousandSign (num) {
//     let str = num.toString()
//     let len = str.length
//     let res = []
//     for (i = len; i > 0; i -= 3) {
//         let block = str.substring(i - 3, i)
//         res.unshift(block)
//     }
//     return res.join(',')
// }

// console.log(getThousandSign(num));

function formatNumberWithCommas (num) {
    let [integerPart, decimalPart] = Math.abs(num).toString().split('.')

    let formattedIntegerPart = ''
    for (let i = integerPart.length - 1, count = 1; i >= 0; i--, count++ ) {
        formattedIntegerPart = integerPart[i] + formattedIntegerPart
        if (count % 3 === 0 && i !== 0) {
            formattedIntegerPart = ',' + formattedIntegerPart
        }
    }

    if (decimalPart) {
        return (num < 0 ? '-' : '') + formattedIntegerPart + '.' + decimalPart
    } else {
        return (num < 0 ? '-' : '') + formattedIntegerPart
    }
}

console.log(formatNumberWithCommas(1234567.89));  // 输出: "1,234,567.89"
console.log(formatNumberWithCommas(-1234567.89)); // 输出: "-1,234,567.89"
console.log(formatNumberWithCommas(1234567));     // 输出: "1,234,567"
console.log(formatNumberWithCommas(-1234567));    // 输出: "-1,234,567"
console.log(formatNumberWithCommas(1234.567));    // 输出: "1,234.567"
console.log(formatNumberWithCommas(-1234.567));   // 输出: "-1,234.567"
console.log(formatNumberWithCommas(0));           // 输出: "0"
console.log(formatNumberWithCommas(-0));          // 输出: "0"