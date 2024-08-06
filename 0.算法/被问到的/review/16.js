// 编程题目：随机输入一串由大括号中括号和小括号以及其他字符组成的字符串，校验是否满足 括号成对出现，不嵌套。

// 输入：[({abcdef}ghjkl)1234]

// 输出： true

// 输入： {[(abcdefg]12345)}

// 输出false


function test (str) {
    const obj = {
        '{': '}',
        '[': ']',
        '(': ')'
    }

    const stack = []

    for (let i = 0; i < str.length; i++) {
        let res = obj[str[i]]
        if (res) {
            stack.push(res)
        }
        if (str[i] === stack[stack.length - 1]) {
            stack.pop()
        }
    }

    return stack.length === 0 ? true : false
}

// 测试用例
console.log(test('{[(abcdefg]12345)}')) // 输出 false
