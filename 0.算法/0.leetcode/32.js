// leetcode 32
// 最长有效括号

// let str = '(()(' // 2
let str = ')()())' // 4

/**
 * 计算给定字符串中最长的有效括号子串的长度
 * @param {string} str - 输入的括号字符串
 * @return {number} - 最长有效括号子串的长度
 */
function getMaxLength (str) {
    let maxLen = 0 // 初始化最长长度为0
    const stack = [] // 使用栈来存储括号的索引
    stack.push(-1) // 初始时栈中放入-1，表示基准位置
    for (let i = 0; i < str.length; i++) {
        let cur = str[i]
        if (cur === '(') {
            stack.push(i) // 遇到左括号，将其索引压入栈中
        } else {
            stack.pop() // 遇到右括号，弹出栈顶元素
            if (stack.length) {
                let curMax = i - stack[stack.length - 1] // 计算当前有效括号长度
                maxLen = Math.max(curMax, maxLen) // 更新最长长度
            } else {
                stack.push(i) // 如果栈为空，压入当前右括号的索引作为新的基准位置
            }
        }
    }
    return maxLen // 返回最长有效括号子串的长度
}

console.log(getMaxLength(str)); // 输出结果
