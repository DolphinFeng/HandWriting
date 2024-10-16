// 1011-code play 九坤 一面

// 题目1:复原IP地址

// 有效 IP 地址 正好由四个整数（每个整数位于 0 到 255 之间组成，且不能含有前导 0），整数之间用 '.' 分隔。
// ●例如："0.1.2.201" 和 "192.168.1.1" 是 有效 IP 地址，但是 "0.011.255.245"、"192.168.1.312" 和 "192.168@1.1" 是 无效 IP 地址。
// 给定一个只包含数字的字符串 s ，用以表示一个 IP 地址，返回所有可能的有效 IP 地址，这些地址可以通过在 s 中插入 '.' 来形成。你 不能 重新排序或删除 s 中的任何数字。你可以按 任何 顺序返回答案。
// 示例 1：
// 输入：s = "25525511135"
// 输出：["255.255.11.135","255.255.111.35"]
// 示例 2：
// 输入：s = "0000"
// 输出：["0.0.0.0"]
// 示例 3：
// 输入：s = "101023"
// 输出：["1.0.10.23","1.0.102.3","10.1.0.23","10.10.2.3","101.0.2.3"]
// 提示：
// ●1 <= s.length <= 20
// ●s 仅由数字组成


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

console.log(restoreIpAddresses("255255255255")); 
// 输出: ["255.255.255.255"]

console.log(restoreIpAddresses("25505011535")); 
// 输出: ["255.0.50.115.35"]

// 长度不足的测试用例
console.log(restoreIpAddresses("123")); 
// 输出: []

// 长度过长的测试用例
console.log(restoreIpAddresses("1234567890123")); 
// 输出: []

// 包含前导零的测试用例
console.log(restoreIpAddresses("010010")); 
// 输出: ["0.10.0.10","0.100.1.0"]