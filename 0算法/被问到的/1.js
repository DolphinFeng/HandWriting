// 给一个数组，例如["a","a","b","b","c","c","c"]
// 原地变换得到下面的结果
// ["a","2","b","2","c","3"]，输出结果6，为得到的结果数组的长度。
// 还有个例子，输入数组为
// ["a"]
// 那么结果为
// ["a"]
// "1"省略，输出结果为得到的结果长度为1

let arr = ["a","a","b","b","c","c","c"];

/**
 * 计算压缩后的数组长度，并在原数组上进行压缩
 * @param {Array} arr - 输入的字符数组
 * @returns {number} - 压缩后的数组长度
 */
function getLength(arr) {
    let res = 0, i = 0;
    // 遍历数组
    while (i < arr.length) {
        let j = i;
        // 找到连续相同字符的区间
        while (j < arr.length && arr[j] === arr[i]) {
            j++;
        }
        // 将当前字符放入结果位置
        arr[res++] = arr[i];
        let count = j - i;
        // 如果字符出现次数大于1，记录次数
        if (count > 1) {
            for (let digit of count.toString()) {
                arr[res++] = digit;
            }
        }
        // 移动到下一个不同字符的位置
        i = j;
    }
    return res;
}

console.log(getLength(arr)); // 输出压缩后的数组长度

