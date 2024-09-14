// 有效括号

s = "()[]{}"

/**
 * 判断输入的括号字符串是否有效
 * @param {string} str - 输入的括号字符串
 * @return {boolean} - 返回布尔值，表示括号字符串是否有效
 */
function isValid (str) {
    let obj = {
        '(': ')',
        '[': ']',
        '{': '}'
    }
    const stack = []
    const len = s.length
    if(len % 2 != 0 ){
        return false
    }
    for(let i = 0; i<len; i++){
        const item = s[i]
        if(item === '(' || item === '{' || item === '['){
            stack.push(item)
        }else{
            if(!stack.length || obj[stack.pop()] !== item){
                return false
            }
        }
    }
    return !stack.length
}

// 输出结果，测试函数是否正确
console.log(isValid(s));
