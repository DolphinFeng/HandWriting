const rl = require("readline").createInterface({ input: process.stdin });
var iter = rl[Symbol.asyncIterator]();
const readline = async () => (await iter.next()).value;

void async function () {
    // 读取输入的字符串 s
    let s = await readline();

    // 初始化计数器
    let countC = 0;
    let countCH = 0;
    let countCHN = 0;

    // 遍历字符串 s
    for (let char of s) {
        if (char === 'C') {
            countC++;
        } else if (char === 'H') {
            countCH += countC;
        } else if (char === 'N') {
            countCHN += countCH;
        }
    }

    // 输出结果
    console.log(countCHN);

    rl.close();
}();

// 在庆祝祖国母亲70华诞之际,老师给小乐乐出了一个问题。大家都知道
// China的英文缩写是CHN,那么给你一个字符串s,你需要做的是统计S中子
// 序列"CHN"的个数。
// 子序列的定义:存在任意下标a<b<c,那么"s[a]s[b]s[c]"就构成成s的一个
// 子序列。如"ABC"的子序列有"A"、"B"、"C"、"AB"、"AC"、""BC"
// "ABC"。
// 输入描述
// 输入只包含大写字母的字符串s。(1<length<8000)
// 输出描述
// 输出一个整数,为字符串s中子序列"CHN"的数量。
// 输入
// CCHNCHN
// 输出
// 7
// 输入
// CCHNCHNCHNCHN
// 输出
// 30