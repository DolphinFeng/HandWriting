/**
 * @param {string[]} words
 * @return {number}
 */
var longestStrChain = function(words) {
    const dp = new Array(words.length).fill(1)

    const sortedWords = words.sort((str1, str2) => str1.length - str2.length)

    for (let i = 1; i < sortedWords.length; i++) {
        for (let j = 0; j < i; j++) {
            if (insertable(words[j], words[i])) {
                dp[i] = Math.max(dp[i], dp[j] + 1)
            }
        }
    }

    return Math.max(...dp)
};

function insertable(str1, str2) {
    if (str1.length + 1 !== str2.length) {
        return false
    }

    let i = 0
    let j = 0

    while (i < str1.length && j < str2.length) {
        if (str1[i] === str2[j]) {
            i++
        }

        j++
    }

    return i === str1.length
}

let words = ["a","b","ba","bca","bda","bdca"]
console.log(longestStrChain(words)) // 4