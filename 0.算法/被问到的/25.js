// leetcode 32
// 最长有效括号

let str = '(()('

function getMaxLength (str) {
    let maxLen = 0
    const stack = []
    stack.push(-1)
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

console.log(getMaxLength(str));