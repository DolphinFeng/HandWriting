// 编程题目：随机输入一串由大括号中括号和小括号以及其他字符组成的字符串，校验是否满足 括号成对出现，不嵌套。

// 输入：[({abcdef}ghjkl)1234]

// 输出： true

// 输入： {[(abcdefg]12345)}

// 输出false

/**
 * 校验输入字符串中的括号是否成对出现且不嵌套
 * @param {string} str - 输入的字符串
 * @returns {boolean} - 如果括号成对出现且不嵌套，返回 true；否则返回 false
 */
function test(str) {
    // 定义括号对应关系的对象
    const obj = {
        '{': '}',
        '[': ']',
        '(': ')'
    }

    // 初始化一个栈，用于存储期望的右括号
    const stack = []
    for (let i = 0; i < str.length; i++) {
        // 如果当前字符是左括号，将对应的右括号压入栈中
        const res = obj[str[i]]
        if (res) {
            stack.push(res)
        }
        // 如果当前字符是栈顶的右括号，弹出栈顶元素
        if (str[i] === stack[stack.length - 1]) {
            stack.pop()
        }
    }
    // 如果栈为空，说明所有括号成对出现且不嵌套，返回 true；否则返回 false
    return stack.length === 0 ? true : false
}

// 测试用例
console.log(test('{[(abcdefg]12345)}')) // 输出 false
