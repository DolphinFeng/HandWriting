// 字符串相加、大数相加  t 神 字节三面

// 给定两个字符串形式的非负整数 num1 和num2 ，计算它们的和并同样以字符串形式返回。

// 你不能使用任何內建的用于处理大整数的库（比如 BigInteger）， 也不能直接将输入的字符串转换为整数形式。

 

// 示例 1：

// 输入：num1 = "11", num2 = "123"
// 输出："134"
// 示例 2：

// 输入：num1 = "456", num2 = "77"
// 输出："533"
// 示例 3：

// 输入：num1 = "0", num2 = "0"
// 输出："0"


function addStrings(num1, num2) {
    let carry = 0; // 进位
    let result = []; // 存储结果
    let i = num1.length - 1; // num1 的指针，从末尾开始
    let j = num2.length - 1; // num2 的指针，从末尾开始

    // 从末尾开始逐位相加，直到两个字符串都处理完
    while (i >= 0 || j >= 0 || carry) {
        let n1 = i >= 0 ? num1[i] - '0' : 0; // 当前 num1 的位数值
        let n2 = j >= 0 ? num2[j] - '0' : 0; // 当前 num2 的位数值

        let sum = n1 + n2 + carry; // 当前位的和
        carry = Math.floor(sum / 10); // 计算新的进位
        result.push(sum % 10); // 将当前位的结果存入 result

        i--; // 移动 num1 的指针
        j--; // 移动 num2 的指针
    }

    return result.reverse().join(''); // 将结果数组反转并转换为字符串
}
console.log(addStrings("11", "123")); // 输出："134"
console.log(addStrings("456", "77")); // 输出："533"
console.log(addStrings("0", "0")); // 输出："0"
console.log(addStrings("999", "1")); // 输出："1000"
console.log(addStrings("123456789", "987654321")); // 输出："1111111110"
console.log(addStrings("1", "999999999999999999999999999999")); // 输出："1000000000000000000000000000000"