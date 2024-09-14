// 罗马数字转数字

function romanToInt (s) {
    let obj = {
        'I': 1,
        'V': 5,
        'X': 10,
        'L': 50,
        'C': 100,
        'D': 500,
        'M': 1000
    }
    const stack = []
    for (let i = 0; i < s.length; i++) {
        if (obj[s[i]] < obj[s[i + 1]]) {
            stack.push(obj[s[i + 1]] - obj[s[i]])
            i++
        } else {
            stack.push(obj[s[i]])
        }
    }
    return stack.reduce((a, b) => a + b)
}

console.log(romanToInt('MCMXCIV')); // 输出: 1994
