function addLargeNumber (num1, num2) {
    if (num1.length < num2.length) {
        [num1, num2] = [num2, num1]
    }
    let carry = 0, res = ''

    for (let i = 0; i < num1.length || carry > 0; i++) {
        let digit1 = i < num1.length ? parseInt(num1[num1.length - 1 - i], 10) : 0
        let digit2 = i < num2.length ? parseInt(num2[num2.length - 1 - i], 10) : 0
        sum = digit1 + digit2 + carry
        carry = Math.floor(sum / 10)
        res = sum % 10 + res
    }
    
    return res
}


console.log(addLargeNumber('123', '456')); // 579
console.log(addLargeNumber('123', '4567')); // 4790
// 边界值测试
console.log(addLargeNumber('0', '0')); // 0
// 大数测试
console.log(addLargeNumber('123456789012345678901234567890',
                           '987654321098765432109876543210')); 
                         // 1111111110111111111011111111100