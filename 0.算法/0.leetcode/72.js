// 编辑距离 给你两个单词 word1 和 word2， 请返回将 word1 转换成 word2 所使用的最少操作数 你可以对一个单词进行如下三种操作：插入一个字符 删除一个字符 替换一个字符

let word1 = "horse", word2 = "ros" // 输出：3
// horse -> rorse (将 'h' 替换为 'r')
// rorse -> rose (删除 'r')
// rose -> ros (删除 'e')


function minDistance(word1, word2) {
    const m = word1.length;
    const n = word2.length;
    
    // 创建一个二维数组 dp，dp[i][j] 表示 word1[0..i-1] 和 word2[0..j-1] 的最小编辑距离
    const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
    
    // 初始化 dp 数组
    for (let i = 0; i <= m; i++) {
        dp[i][0] = i; // word1 的前 i 个字符转换成空字符串所需的操作数
    }
    for (let j = 0; j <= n; j++) {
        dp[0][j] = j; // 空字符串转换成 word2 的前 j 个字符所需的操作数
    }
    
    // 填充 dp 数组
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (word1[i - 1] === word2[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1]; // 如果字符相同，不需要额外操作
            } else {
                dp[i][j] = Math.min(
                    dp[i - 1][j] + 1,    // 删除操作
                    dp[i][j - 1] + 1,    // 插入操作
                    dp[i - 1][j - 1] + 1 // 替换操作
                );
            }
        }
    }
    
    return dp[m][n];
}


console.log(minDistance(word1, word2)); // 输出：3
