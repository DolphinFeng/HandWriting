// 罗马数字转数字

function romanToInt (s) {
    obj = {
        'I': 1,
        'V': 5,
        'X': 10,
        'L': 50,
        'C': 100,
        'D': 500,
        'M': 1000
    }
    let len = s.length
    const stack = []
    for(let i = 0 ; i<len ; i++){
        if(obj[s[i]] < obj[s[i+1]]){
            stack.push(obj[s[i+1]] - obj[s[i]])
            i++
        }else
            stack.push(obj[s[i]])
    }
    let sum = 0
    for(let item of stack){
        sum += item
    }
    return sum
}

let s = 'MCMXCIV'
console.log(romanToInt(s)); // 输出: 1994
