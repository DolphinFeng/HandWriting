let a = [1, 2, 3, 4, 5] //[2,3,4,5] [1,3,4,5]
let b = [3, 1, 7, 12]
let c = [14, 5, 9, 2]

/**
 * 对数组进行排序，并计算相邻元素的差值
 * @param {Array} arr - 输入的数组
 * @returns {Array} - 处理后的数组，包含排序后相邻元素的差值
 */
function qian(arr) {
    // 对数组进行升序排序，并计算相邻元素的差值
    return arr.sort((a, b) => a - b).map((val, index, sortedArr) => index === 0 ? val : val - sortedArr[index - 1]);
}

/**
 * 处理两个数组，计算相邻元素差值后合并去重
 * @param {Array} b - 输入的第一个数组
 * @param {Array} c - 输入的第二个数组
 * @returns {Set} - 合并去重后的结果集
 */
function test(b, c) {
    // 处理第一个数组，计算相邻元素差值
    const a1 = qian(b);
    // 处理第二个数组，计算相邻元素差值
    const a2 = qian(c);
    // 合并两个数组并去重
    return new Set([...a1, ...a2]);
}

// 输出处理后的结果
console.log(test(b, c));
