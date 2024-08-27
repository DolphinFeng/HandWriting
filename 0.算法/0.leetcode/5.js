// 最长回文子串

// 给你一个字符串 s，找到 s 中最长的 回文子串

// 示例 1：

// 输入：s = "babad"
// 输出："bab"
// 解释："aba" 同样是符合题意的答案。
// 示例 2：

// 输入：s = "cbbd"
// 输出："bb"

function longestPalindrome(s) {
    if (s.length < 2) {
        return s;
    }

    let start = 0, maxLength = 1;

    function expandAroundCenter(left, right) {
        while (left >= 0 && right < s.length && s[left] === s[right]) {
            left--;
            right++;
        }
        return right - left - 1;
    }

    for (let i = 0; i < s.length; i++) {
        let len1 = expandAroundCenter(i, i);
        let len2 = expandAroundCenter(i, i + 1);
        let len = Math.max(len1, len2);

        if (len > maxLength) {
            maxLength = len;
            start = i - Math.floor((len - 1) / 2);
        }
    }

    return s.substring(start, start + maxLength);
}

console.log(longestPalindrome("babad")); // 输出: "bab" 或 "aba"
console.log(longestPalindrome("cbbd"));  // 输出: "bb"
console.log(longestPalindrome("a"));     // 输出: "a"
console.log(longestPalindrome("ac"));    // 输出: "a" 或 "c"
console.log(longestPalindrome("racecar")); // 输出: "racecar"
console.log(longestPalindrome(""));      // 输出: ""
console.log(longestPalindrome("abccba")); // 输出: "abccba"
console.log(longestPalindrome("forgeeksskeegfor")); // 输出: "geeksskeeg"