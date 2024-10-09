function format (num) {
    let [int, float] = Math.abs(num).toString().split('.')

    let acc = ''
    for (let i = int.length - 1, count = 1; i >= 0; i--, count++) {
        acc = int[i] + acc
        if (count % 3 === 0 && i !== 0) {
            acc = ',' + acc
        }
    }

    if (float) {
        return (num >= 0 ? '' : '-') + acc + '.' + float
    } else {
        return (num >= 0 ? '' : '-') + acc
    }
}

console.log(format(1234567.89));  // 输出: "1,234,567.89"
console.log(format(-1234567.89)); // 输出: "-1,234,567.89"
console.log(format(1234567));     // 输出: "1,234,567"
console.log(format(-1234567));    // 输出: "-1,234,567"
console.log(format(1234.567));    // 输出: "1,234.567"
console.log(format(-1234.567));   // 输出: "-1,234.567"
console.log(format(0));           // 输出: "0"
console.log(format(-0));          // 输出: "0"