// leetcode 32
// 最长有效括号

let str = '(()(' // 2
// let str = ')()())' // 4

function getMaxLength (str) {
    let maxLen = 0
    let stack = [-1]
    for (let i = 0; i < str.length; i++) {
        let cur = str[i]
        if (cur === '(') {
            stack.push(i)
        } else {
            stack.pop()
            if (stack.length) {
                let curMax = i - stack[stack.length - 1]
                maxLen = Math.max(curMax, maxLen)
            } else {
                stack.push(i)
            }
        }
    }
    return maxLen
}

console.log(getMaxLength(str)); // 输出结果
