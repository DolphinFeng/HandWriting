// 最长公共前缀 百度三面

// 编写一个函数来查找字符串数组中的最长公共前缀。

// 如果不存在公共前缀，返回空字符串 ""。

 

// 示例 1：

// 输入：strs = ["flower","flow","flight"]
// 输出："fl"
// 示例 2：

// 输入：strs = ["dog","racecar","car"]
// 输出：""
// 解释：输入不存在公共前缀。

function longestCommonPrefix (strs) {
    let prefix = strs[0]
    for (let i = 1; i < strs.length; i++) {
        while (strs[i].indexOf(prefix) !== 0) {
            prefix = prefix.substring(0, prefix.length - 1)
            if (!prefix.length) return ''
        }
    }
    return prefix
}


let strs1 = ["flower", "flow", "flight"];
// let strs1 = ["dog","racecar","car"];
console.log(longestCommonPrefix(strs1)); // 输出: "fl"