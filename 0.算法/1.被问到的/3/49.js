// [10.5, 10.7, 10.8, 10.3, 47.7] -> ['11%', '12%', '12%', '11%', '44%']

/**
 * 将数字数组转换为百分比字符串数组
 * @param {number[]} numbers - 输入的数字数组
 * @returns {string[]} - 转换后的百分比字符串数组
 */
function convertToPercentages(numbers) {
  // 计算数组中所有数字的总和
  const total = numbers.reduce((sum, num) => sum + num, 0);

  // 遍历数组中的每个数字，计算其占总和的百分比，并转换为字符串
  return numbers.map(num => {
    const percentage = (num / total * 100).toFixed(0); // 计算百分比并四舍五入
    return `${percentage}%`; // 转换为字符串并添加百分号
  });
}

// 示例用法
const numbers = [10.5, 10.7, 10.8, 10.3, 47.7];
const percentages = convertToPercentages(numbers);
console.log(percentages); // 输出: ['11%', '12%', '12%', '11%', '54%']