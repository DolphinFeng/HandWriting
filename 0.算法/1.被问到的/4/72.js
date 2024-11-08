const rl = require("readline").createInterface({ input: process.stdin });
var iter = rl[Symbol.asyncIterator]();
const readline = async () => (await iter.next()).value;

void async function () {
    // 读取输入的整数 n
    let n = parseInt(await readline());

    // 初始化杨辉三角
    let triangle = [];

    // 生成杨辉三角的前 n 行
    for (let i = 0; i < n; i++) {
        triangle[i] = [];
        for (let j = 0; j <= i; j++) {
            if (j === 0 || j === i) {
                triangle[i][j] = 1;
            } else {
                triangle[i][j] = triangle[i - 1][j - 1] + triangle[i - 1][j];
            }
        }
    }

    // 输出杨辉三角的前 n 行，每个数输出域宽为 5
    for (let i = 0; i < n; i++) {
        let line = triangle[i].map(num => num.toString().padStart(5, ' ')).join('');
        console.log(' ' + line.trim());
    }

    rl.close();
}();
// KiKi知道什么叫杨辉三角之后对杨辉三角产生了浓厚的兴趣,他想知道杨辉
// 三角的前n行,请编程帮他解答。杨辉三角,本质上是二项式(aa+b)的n次方
// 展开后各项的系数排成的三角形。其性质包括:每行的端点数为1,一个数
// 也为1;每个数等于它左上方和上方的两数之和。
// 输入描述
// 第一行包含一个整数数n。(1<n<30)
// 输出描述
// 包含n行,为杨辉三角的前n行,每个数输出域宽为5。
// 输入：6
// 输出
// 1
// 1    1
// 1    2    1
// 1    3    3    1
// 1    4    6    4    1
// 1    5   10   10    5    1

