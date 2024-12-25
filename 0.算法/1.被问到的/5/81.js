// 编辑试题描述 编写函数format实现金额按千分位分隔转化，如：
// format('12345') --> '12,345.00'
// format('1234.5') --> '1,234.50'
// 规则：
// 1.保留2位小数
// 2 整数部分每3位用逗号分隔 3.禁止使用js原生的toLocaleString方法

function format(number) {
    // 保留2位小数
    let [integerPart, decimalPart] = parseFloat(number).toFixed(2).split('.');
    
    // 整数部分每3位用逗号分隔
    integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    
    return `${integerPart}.${decimalPart}`;
}

// Example usage:
console.log(format('12345')); // '12,345.00'
console.log(format('1234.5')); // '1,234.50'