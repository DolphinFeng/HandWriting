// 检查字符串是否连续包含 a-zA-Z 若满足则返回 true，否则返回 false

function containsAlphabet(str) {
    // 使用正则表达式检查是否包含字母 a-zA-Z
    const regex = /[a-zA-Z]/;
    return regex.test(str);
}

// 示例用法:
console.log(containsAlphabet("1234")); // 输出: false
console.log(containsAlphabet("abc123")); // 输出: true
console.log(containsAlphabet("!@#$%^&*()")); // 输出: false
console.log(containsAlphabet("Hello, World!")); // 输出: true