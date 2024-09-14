// 最长回文子串

function longestPalindrome (s) {
    if (s.length <= 1) return s

    let max = 1, start = 0

    for (let i = 0; i < s.length; i++) {
        let len1 = expand(i, i)
        let len2 = expand(i, i + 1)
        let len = Math.max(len1, len2)

        if (len > max) {
            max = len
            start = i - ~~((len - 1) / 2)
        }
    }

    function expand (left, right) {
        while (left >= 0 && right < s.length && s[left] === s[right]) {
            left--
            right++
        }
        return right - left - 1
    }

    return s.substring(start, start + max)
}

console.log(longestPalindrome('a'));
