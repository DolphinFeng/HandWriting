const rl = require("readline").createInterface({ input: process.stdin });
var iter = rl[Symbol.asyncIterator]();
const readline = async () => (await iter.next()).value;

function isPalindrome(str) {
    let len = str.length;
    for (let i = 0; i < len / 2; i++) {
        if (str[i] !== str[len - 1 - i]) {
            return false;
        }
    }
    return true;
}

void async function () {
    // 读取输入的字符串 A 和 B
    let A = await readline();
    let B = await readline();

    let count = 0;

    // 遍历所有可能的插入位置
    for (let i = 0; i <= A.length; i++) {
        // 在 A 的第 i 个位置插入 B
        let newStr = A.slice(0, i) + B + A.slice(i);
        // 检查新字符串是否是回文串
        if (isPalindrome(newStr)) {
            count++;
        }
    }

    // 输出结果
    console.log(count);

    rl.close();
}();
// 文串"是一个正读和反读都一样的字符串,比如"level"或者"noon"等等就
// 是回文串。花花非常喜欢这种拥有对称美的回文串,生日的时候她得到两个
// 礼物分别是字符串A和字符串B。现在她非常好奇有没有办法将字符串B插入
// 字符串A使产生的字符串是一个回文串。你接受花花的请求求,帮助她寻找有
// 多少种插入办法可以使新串是一个回文串。如果字符串B插入的为位置不同就
// 考虑为不一样的办法。
// 例如:
// A="aba",B="b"。这里有4种把B插入A的办法:
// 在A的第一个字母之前:"baba"不是回文
// *
// *在第一个字母'a'之后:"abba"是回文
// *在字母'b'之后:"abba"是回文
// *在第二个字母'a'之后"abab"不是回文
// 所以满足条件的答案为2

// 输入描述
// 每组输入数据共两行。
// 第一行为字符串A,第二行为字符串B。
// 字符串长度均小于100000且只包含小写字母
// 输出描述
// 输出一个数字,表示把字符串B插入字符串A之后构成一个回文串的方法数
// 输入
// aba
// b
// 输出
// 2