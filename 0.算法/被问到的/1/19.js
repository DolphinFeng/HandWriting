// 实现复数求和

// ['-5', '5-i', '6+3i', '-4+0i'] === 2+2i


function sumComplexNumbers(complexNumbers) {
    let realSum = 0;
    let imaginarySum = 0;

    complexNumbers.forEach(complex => {
        let real = 0, imaginary = 0;
        if (complex.includes('i')) {
            let parts = complex.split(/(?=[+-])/);
            parts.forEach(part => {
                if (part.includes('i')) {
                    let value = part.replace('i', '');
                    if (value === '+' || value === '') {
                        value = '1';
                    } else if (value === '-') {
                        value = '-1';
                    }
                    imaginary += parseInt(value);
                } else {
                    real += parseInt(part);
                }
            });
        } else {
            real = parseInt(complex);
        }
        realSum += real;
        imaginarySum += imaginary;
    });

    let result = `${realSum}`;
    if (imaginarySum !== 0) {
        result += (imaginarySum > 0 ? '+' : '') + `${imaginarySum}i`;
    }
    return result;
}

// 示例调用
console.log(sumComplexNumbers(['-5', '5-i', '6+3i', '-4+0i'])); // 输出: "2+2i"

