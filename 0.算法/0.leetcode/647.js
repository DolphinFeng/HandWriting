// 647. 回文子串

/**
 * @param {string} s
 * @return {number}
 */
var countSubstrings = function(s) {
    let count = 0;
    
    // 辅助函数：从中心向两边扩展检查回文
    const expandAroundCenter = (left, right) => {
        while (left >= 0 && right < s.length && s[left] === s[right]) {
            count++;
            left--;
            right++;
        }
    };
    
    // 遍历每个可能的中心点
    for (let i = 0; i < s.length; i++) {
        // 以单个字符为中心
        expandAroundCenter(i, i);
        // 以两个字符之间的空隙为中心
        expandAroundCenter(i, i + 1);
    }
    
    return count;
};

let s = "aaa"
console.log(countSubstrings(s));
