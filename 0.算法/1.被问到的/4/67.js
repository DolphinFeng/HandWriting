// font-size -> fontSize 实现这种算法

function convertToCamelCase(str) {
    return str
        .split('-') // 将字符串按 '-' 分割成数组
        .map((word, index) => {
            if (index === 0) {
                return word; // 第一个单词保持不变
            }
            return word.charAt(0).toUpperCase() + word.slice(1); // 其他单词首字母大写
        })
        .join(''); // 将数组重新连接成字符串
}

// 示例用法:
console.log(convertToCamelCase("font-size")); // 输出: fontSize
console.log(convertToCamelCase("background-color")); // 输出: backgroundColor
console.log(convertToCamelCase("border-left-width")); // 输出: borderLeftWidth
console.log(convertToCamelCase("margin-top")); // 输出: marginTop
console.log(convertToCamelCase("padding-right")); // 输出: paddingRight