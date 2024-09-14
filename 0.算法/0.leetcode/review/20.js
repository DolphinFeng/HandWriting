// 有效括号

// s = "([}}])"
s = "()"

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

console.log(isValid(s));