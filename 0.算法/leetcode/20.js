// 有效括号

s = "()[]{}"

/**
 * 判断输入的括号字符串是否有效
 * @param {string} str - 输入的括号字符串
 * @return {boolean} - 返回布尔值，表示括号字符串是否有效
 */
function isValid (str) {
    // 定义括号对应关系的对象
    let obj = {
        '(': ')',
        '[': ']',
        '{': '}'
    }
    // 初始化一个空栈
    let stack = []
    // 遍历输入字符串
    for (let i = 0; i < str.length; i++) {
        // 获取当前字符对应的闭合括号
        let res = obj[str[i]]
        // 如果当前字符是开括号，则将对应的闭合括号入栈
        if (res) {
            stack.push(res)
        }
        // 如果当前字符是闭合括号且与栈顶元素匹配，则将栈顶元素出栈
        if (str[i] === stack[stack.length - 1]) {
            stack.pop()
        }
    }
    // 如果栈为空，说明括号字符串有效，否则无效
    return stack.length === 0 ? true : false
}

// 输出结果，测试函数是否正确
console.log(isValid(s));
