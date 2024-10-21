function restoreIpAddresses(s) {
    if (s.length > 12 || s.length < 4) return []
    let res = [], path = []

    const dfs = (index) => {
        if (path.length > 4) return
        if (index === s.length && path.length >= 4) {
            return res.push(path.join('.'))
        }
        let temp = ''
        for (let i = index; i < s.length; i++) {
            temp = temp + s[i]
            if (
                Number(temp) >= 0 &&
                Number(temp) <= 255 &&
                (temp[0] !== '0' || temp === '0')
            ) {
                path.push(temp)
                dfs(i + 1)
                path.pop()
            }
        }
    }

    dfs(0)
    return res
}

// 示例测试用例
console.log(restoreIpAddresses("101023")); 
// 输出: ["1.0.10.23","1.0.102.3","10.1.0.23","10.10.2.3","101.0.2.3"]

// 边界测试用例
console.log(restoreIpAddresses("0000")); 
// 输出: ["0.0.0.0"]

console.log(restoreIpAddresses("1111")); 
// 输出: ["1.1.1.1"]