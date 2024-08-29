// 最长递增子序列 蔚来秋招一面

// 输入：nums = [10,9,2,5,3,7,101,18]
// 输出：4
// 解释：最长递增子序列是 [2,3,7,101]，因此长度为 4 。

// 输入：nums = [0,1,0,3,2,3]
// 输出：4

// 输入：nums = [7,7,7,7,7,7,7]
// 输出：1

function lengthOfLIS (arr) {
    if (!arr.length) return 0
    const dp = new Array(arr.length).fill(1)

    for (let i = 1; i < arr.length; i++) {
        for (let j = 0; j < i; j++) {
            if (arr[i] > arr[j]) {
                dp[i] = Math.max(dp[i], dp[j] + 1)
            }
        }
    }

    return Math.max(...dp)
}


let nums = [10, 9, 2, 5, 3, 7, 101, 18];
console.log(lengthOfLIS(nums)); // 输出：4