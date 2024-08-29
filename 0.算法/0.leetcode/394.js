// 字符串解码

// 给定一个经过编码的字符串，返回它解码后的字符串。

// 编码规则为: k[encoded_string]，表示其中方括号内部的 encoded_string 正好重复 k 次。注意 k 保证为正整数。

// 你可以认为输入字符串总是有效的；输入字符串中没有额外的空格，且输入的方括号总是符合格式要求的。

// 此外，你可以认为原始数据不包含数字，所有的数字只表示重复的次数 k ，例如不会出现像 3a 或 2[4] 的输入。

 

// 示例 1：

// 输入：s = "3[a]2[bc]"
// 输出："aaabcbc"
// 示例 2：

// 输入：s = "3[a2[c]]"
// 输出："accaccacc"
// 示例 3：

// 输入：s = "2[abc]3[cd]ef"
// 输出："abcabccdcdcdef"
// 示例 4：

// 输入：s = "abc3[cd]xyz"
// 输出："abccdcdcdxyz"


function decodeString(s) {
    let stack = []; // 用于存储字符的栈
    let currentNum = 0; // 当前的数字
    let currentString = ''; // 当前的字符串

    for (let char of s) {
        if (!isNaN(char)) {
            // 如果当前字符是数字
            currentNum = currentNum * 10 + Number(char); // 计算多位数
        } else if (char === '[') {
            // 如果当前字符是 '['
            stack.push(currentString); // 将当前字符串压入栈中
            stack.push(currentNum); // 将当前数字压入栈中
            currentString = ''; // 重置当前字符串
            currentNum = 0; // 重置当前数字
        } else if (char === ']') {
            // 如果当前字符是 ']'
            let num = stack.pop(); // 从栈中弹出数字
            let prevString = stack.pop(); // 从栈中弹出之前的字符串
            currentString = prevString + currentString.repeat(num); // 重复当前字符串并与之前的字符串拼接
        } else {
            // 如果当前字符是字母
            currentString += char; // 将当前字符添加到当前字符串中
        }
    }

    return currentString; // 返回解码后的字符串
}


 // 示例 1
 let s1 = "3[a]2[bc]";
 console.log(decodeString(s1)); // 输出："aaabcbc"
 
 // 示例 2
 let s2 = "3[a2[c]]";
 console.log(decodeString(s2)); // 输出："accaccacc"
 
 // 示例 3
 let s3 = "2[abc]3[cd]ef";
 console.log(decodeString(s3)); // 输出："abcabccdcdcdef"
 
 // 示例 4
 let s4 = "abc3[cd]xyz";
 console.log(decodeString(s4)); // 输出："abccdcdcdxyz"
 
 // 其他测试用例
 let s5 = "10[a]";
 console.log(decodeString(s5)); // 输出："aaaaaaaaaa"
 
 let s6 = "2[3[a]b]";
 console.log(decodeString(s6)); // 输出："aaabaaab"
 
 let s7 = "3[a2[b4[F]c]]";
 console.log(decodeString(s7)); // 输出："abFFFFcbFFFFcabFFFFcbFFFFcabFFFFcbFFFFc"
 