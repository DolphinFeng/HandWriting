// 编辑距离 给你两个单词 word1 和 word2， 请返回将 word1 转换成 word2 所使用的最少操作数 你可以对一个单词进行如下三种操作：插入一个字符 删除一个字符 替换一个字符

let word1 = "horse", word2 = "ros" // 输出：3
// horse -> rorse (将 'h' 替换为 'r')
// rorse -> rose (删除 'r')
// rose -> ros (删除 'e')


var minDistance = function(word1, word2) {
    const dp = Array.from({ length: word2.length + 1 }, (item, index) => index);
    // 保存的是左上角的值
    let before;
    for (let i = 1; i <= word1.length; i++) {
      before = dp[ 0 ];
      dp[ 0 ] = i;
      for (let j = 1; j < dp.length; j++) {
        // 先将左上角值缓存，后续在进行更新
        const temp = dp[ j ];
        const flag = word1[i - 1] === word2[j - 1] ? 1 : 0;
        dp[j] = 1 + Math.min(dp[j - 1], dp[j], before - flag);
        before = temp;
      }
    }
    return dp[ dp.length - 1 ]
  };

console.log(minDistance(word1, word2)) // 3