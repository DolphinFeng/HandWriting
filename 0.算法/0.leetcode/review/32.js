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
                maxLen = Math.max(maxLen, i - stack[stack.length -1])
            } else {
                stack.push(i)
            }
        }
    }
    return maxLen
}


console.log(getMaxLength(str));
