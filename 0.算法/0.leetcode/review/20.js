// 有效括号

s = "()[]{}"

function isValid (str) {
    let obj = {
        '(': ')',
        '[': ']',
        '{': '}'
    }
    let stack = []
    for (let i = 0; i < str.length; i++) {
        let cur = obj[str[i]]
        if (cur) {
            stack.push(cur)
        } else {
            if (str[i] === stack[stack.length - 1]) {
                stack.pop()
            }
        }
    }    
    return stack.length === 0 ? true : false
}

console.log(isValid(s));