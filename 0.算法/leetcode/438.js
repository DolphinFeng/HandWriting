// 找到字符串中所有字母异位词

// 给定两个字符串 s 和 p，找到 s 中所有 p 的 异位词 的子串，返回这些子串的起始索引。不考虑答案输出的顺序。

// 异位词 指由相同字母重排列形成的字符串（包括相同的字符串）。

 

// 示例 1:

// 输入: s = "cbaebabacd", p = "abc"
// 输出: [0,6]
// 解释:
// 起始索引等于 0 的子串是 "cba", 它是 "abc" 的异位词。
// 起始索引等于 6 的子串是 "bac", 它是 "abc" 的异位词。
//  示例 2:

// 输入: s = "abab", p = "ab"
// 输出: [0,1,2]
// 解释:
// 起始索引等于 0 的子串是 "ab", 它是 "ab" 的异位词。
// 起始索引等于 1 的子串是 "ba", 它是 "ab" 的异位词。
// 起始索引等于 2 的子串是 "ab", 它是 "ab" 的异位词。

var findAnagrams = function(s, p) {
    // 初始化结果数组
    const result = [];
    // 初始化两个计数器
    const p_count = new Array(26).fill(0);
    const s_count = new Array(26).fill(0);
    // 获取字符串 p 的长度
    const p_len = p.length;
    // 获取字符串 s 的长度
    const s_len = s.length;

    // 边界条件，如果 s 的长度小于 p 的长度，直接返回空数组
    if (s_len < p_len) return result;

    // 计算字符串 p 中每个字符的频率
    for (let i = 0; i < p_len; i++) {
        p_count[p.charCodeAt(i) - 97]++;
        s_count[s.charCodeAt(i) - 97]++;
    }

    // 比较初始窗口的字符频率
    if (p_count.toString() === s_count.toString()) {
        result.push(0);
    }

    // 滑动窗口遍历字符串 s
    for (let i = p_len; i < s_len; i++) {
        // 增加新字符的频率
        s_count[s.charCodeAt(i) - 97]++;
        // 减少旧字符的频率
        s_count[s.charCodeAt(i - p_len) - 97]--;
        // 比较当前窗口的字符频率
        if (p_count.toString() === s_count.toString()) {
            result.push(i - p_len + 1);
        }
    }

    // 返回结果数组
    return result;
};

console.log(findAnagrams("cbaebabacd", "abc")); // 输出: [0, 6]
console.log(findAnagrams("abab", "ab")); // 输出: [0, 1, 2]