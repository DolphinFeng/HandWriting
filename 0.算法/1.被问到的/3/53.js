// 给你一个由若干a和b组成的字符串s，请你计算并返回将该
// 字符串分割成两个 非空 子字符串(即 左 子字符串和 右 子字符
// 串)所能获得的最大得分。
// [分割字符串的得分」为左子字符串中 a的数量加上右子字符串
// 中b的数量。
// 补充说明
// 2<= s.length <= 500
// 字符串 s仅由字符'a' 和'b'组成。

// 输入："abbbab"
// 输出：5
// 将字符串 s 划分为两个非空子字符串的可行方案有：
// 左子字符串 = "a" 且 右子字符串 = "bbbab"，得分 = 1 + 4 = 5 
// 左子字符串 = "ab" 且 右子字符串 = "bbab"，得分 = 1 + 3 = 4 
// 左子字符串 = "abb" 且 右子字符串 = "bab"，得分 = 1 + 2 = 3 
// 左子字符串 = "abbb" 且 右子字符串 = "ab"，得分 = 1 + 1 = 2 
// 左子字符串 = "abbba" 且 右子字符串 = "b"，得分 = 2 + 1 = 3

// 输入："aabbb"
// 输出：5 
// 当 左子字符串 = "aa" 且 右子字符串 = "bbb" 时，我们得到最大得分 = 2 + 3 = 5

// 输入："bbbb"
// 输出：3
// 当 左子字符串 = "b" 且 右子字符串 = "bbb" 时，我们得到最大得分 = 0 + 3 = 3

/**
 * 代码中的类名、方法名、参数名已经指定，请勿修改，直接返回方法规定的值即可
 *
 * 
 * @param str string字符串 
 * @return int整型
 */
function StringSplit( str ) {
    // write code here
}
module.exports = {
    StringSplit : StringSplit
};

function StringSplit(str) {
    let maxScore = 0;
    let n = str.length;

    for (let i = 1; i < n; i++) {
        let left = str.slice(0, i);
        let right = str.slice(i);

        let leftScore = (left.match(/a/g) || []).length;
        let rightScore = (right.match(/b/g) || []).length;

        let score = leftScore + rightScore;
        maxScore = Math.max(maxScore, score);
    }

    return maxScore;
}

module.exports = {
    StringSplit: StringSplit
};

// 测试代码
console.log(StringSplit("abbbab")); // 输出: 5
console.log(StringSplit("aabbb"));  // 输出: 5
console.log(StringSplit("bbbb"));   // 输出: 3