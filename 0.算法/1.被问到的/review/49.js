// [10.5, 10.7, 10.8, 10.3, 47.7] -> ['11%', '12%', '12%', '11%', '44%']


function convertToPercentages (nums) {
    let total = nums.reduce((sum, num) => sum + num, 0)

    return nums.map(num => {
        let percentage = (num / total * 100).toFixed(0)
        return `${percentage}%`
    })
}


// 示例用法
const numbers = [10.5, 10.7, 10.8, 10.3, 47.7];
const percentages = convertToPercentages(numbers);
console.log(percentages); // 输出: ['11%', '12%', '12%', '11%', '54%']