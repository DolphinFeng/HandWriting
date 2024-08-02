// 编程题目：随机输入一串由大括号中括号和小括号以及其他字符组成的字符串，校验是否满足 括号成对出现，不嵌套。

// 输入：[({abcdef}ghjkl)1234]

// 输出： true

// 输入： {[(abcdefg]12345)}

// 输出falses

let str = '{[(abcdefg]12345)}'

function judge (str) {
    let len = str.length
    let obj = {
        '(': ')',
        '[': ']',
        '{': '}'
    }
    let stack = []

    for (let i = 0; i < len; i++) {
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

console.log(judge(str));