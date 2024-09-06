function formatNumberWithCommas (num) {
    let [integerPart, decimalPart] = Math.abs(num).toString().split('.')
    let formattedIntegerPart = ''
    for (let i = integerPart.length - 1, count = 1; i >= 0; i--, count++) {
        formattedIntegerPart = integerPart[i] + formattedIntegerPart
        if (count % 3 === 0 && i !== 0) {
            formattedIntegerPart = ',' + formattedIntegerPart
        }
    }

    if (decimalPart) {
        return (num >= 0 ? '' : '-') + formattedIntegerPart + '.' + decimalPart
    } else {
        return (num >= 0 ? '' : '-') + formattedIntegerPart
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