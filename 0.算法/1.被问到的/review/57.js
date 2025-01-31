// 蔚来实习一面
// 由范围 [0,n] 内所有整数组成的 n + 1 个整数的排列序列perm可以表示为长度为 n 的字符串 s ，其中:
// 如果 perm[i] < perm[i + 1] ，那么 s[i] == 'I' 
// 如果 perm[i] > perm[i + 1] ，那么 s[i] == 'D' 

// 要求：给定一个字符串 s ，重构排列 perm 并返回它。如果有多个有效排列perm，则返回其中 任何一个 。

// 示例 1：

// 输入：s = "IDID"
// 输出：[0,4,1,3,2]
// 示例 2：

// 输入：s = "III"
// 输出：[0,1,2,3]
// 示例 3：

// 输入：s = "DDI"
// 输出：[3,2,0,1]

// 提示：

// 1 <= s.length <= 105
// s 只包含字符 "I" 或 "D"

function getString (s) {
    let left = 0
    let right = s.length
    let res = []
    for (let i = 0; i < s.length; i++) {
        if (s[i] === 'I') {
            res.push(left++)
        } else {
            res.push(right--)
        }
    }
    res.push(left)
    return res
}

// 示例测试用例
console.log(getString("IDID")); // 输出: [0, 4, 1, 3, 2]
console.log(getString("III"));  // 输出: [0, 1, 2, 3]
console.log(getString("DDI"));  // 输出: [3, 2, 0, 1]

