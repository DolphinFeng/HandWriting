// 763. 划分字母区间

const partitionLabels = (S) => {
    const maxPos = {};
    for (let i = 0; i < S.length; i++) { // 存放字母与它的最远位置
        maxPos[S[i]] = i;
    }

    const res = [];
    let start = 0;                        // 待切割的起始位置
    let scannedCharMaxPos = 0;            // 已扫描的字符中最远的位置

    for (let i = 0; i < S.length; i++) {
        const curCharMaxPos = maxPos[S[i]]; // 当前扫描的字符的最远位置
        scannedCharMaxPos = Math.max(scannedCharMaxPos, curCharMaxPos); // 更新「已扫描的字符中最远的位置」
        if (i == scannedCharMaxPos) { // 正好扫描到「已扫描的字符的最远位置」，到达切割点
            res.push(i - start + 1);
            start = i + 1;              // 更新，下一个待切割的字符串的起始位置
        }
    }
    return res;
};

// 示例 1
let s1 = "ababcbacadefegdehijhklij";
console.log(partitionLabels(s1)); // 输出: [9,7,8]
/*
划分结果为 "ababcbaca", "defegde", "hijhklij"。
每个部分都包含字符的所有出现位置。
例如 "ababcbaca" 包含字母 a,b,c 的所有出现。
*/

// 示例 2
let s2 = "eccbbbbdec";
console.log(partitionLabels(s2)); // 输出: [10]
/*
整个字符串都必须作为一个片段，因为所有字符都相互交叉。
*/

// 示例 3
let s3 = "abc";
console.log(partitionLabels(s3)); // 输出: [1,1,1]
/*
每个字符都可以单独作为一个片段。
*/

// 示例 4
let s4 = "abcde";
console.log(partitionLabels(s4)); // 输出: [1,1,1,1,1]

// 示例 5
let s5 = "caedbdedda";
console.log(partitionLabels(s5)); // 输出: [1,9]
