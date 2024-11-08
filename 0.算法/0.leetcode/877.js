var stoneGame = function (piles) {
    let len = piles.length;
  
    let dp = new Array(len)
      .fill(0)
      .map((i, idx) => new Array(len).fill(piles[idx]));
  
    for (let i = len - 2; i >= 0; i--) {
      for (let j = i + 1; j < len; j++) {
        dp[i][j] = Math.max(piles[i] - dp[i + 1][j], piles[j] - dp[i][j - 1]);
      }
    }
  
    return dp[0][len - 1] > 0;
  };

  
console.log(stoneGame([5, 3, 4, 5])); // true