// 给定一个由n个正整数组成数组，并指定一个结果m，求出将n个正整数通过相加或者相减的方式，得到结果m的组合方式有多少种?
// 例:数组:[1,1,1,1,1],结果:3  组合方式:
// 1+1+1+1-1=3
// 1+1+1-1+1=3
// 1+1-1+1+1=3
// 1-1+1+1+1-3
// -1+1+1+1+1=3
// 一共有5种组合方式

/**
 * 给定一个由n个正整数组成的数组nums，并指定一个结果S，
 * 求出将n个正整数通过相加或者相减的方式，得到结果S的组合方式有多少种。
 * 
 * @param {number[]} nums - 输入的正整数数组
 * @param {number} S - 目标结果
 * @return {number} - 达到目标结果的组合方式数量
 */
function findTargetSumWays(nums, S) {
    let count = 0; // 记录达到目标结果的组合方式数量

    /**
     * 递归计算所有可能的组合方式
     * 
     * @param {number[]} nums - 输入的正整数数组
     * @param {number} i - 当前处理的数组索引
     * @param {number} sum - 当前组合的和
     * @param {number} S - 目标结果
     */
    function calculate(nums, i, sum, S) {
        if (i === nums.length) { // 如果已经处理完数组中的所有元素
            if (sum === S) { // 如果当前组合的和等于目标结果
                count++; // 组合方式数量加1
            }
        } else {
            // 递归计算加上当前元素的情况
            calculate(nums, i + 1, sum + nums[i], S);
            // 递归计算减去当前元素的情况
            calculate(nums, i + 1, sum - nums[i], S);
        }
    }

    // 从索引0开始，初始和为0，开始递归计算
    calculate(nums, 0, 0, S);
    return count; // 返回达到目标结果的组合方式数量
}


const nums = [1, 1, 1, 1, 1];
const S = 3;
console.log(findTargetSumWays(nums, S)); // 输出: 5



// function total(nums, m, path = [], result = [], nowindex = 0) {
//     if (nowindex === nums.length) {
//         // console.log(path.reduce((a,b)=>a+b,0));
//         // console.log(path);
//         if (path.reduce((a, b) => a + b, 0) === m) {
//             result.push([path.join(',')])
//             return result;
//         }
//         return
//     }
//     for (let i = nowindex, j = 0; j < 2; j++) {
//         path.push(nums[i])
//         nums[i] = -nums[i]
//         total(nums, m, path, result, nowindex + 1)
//         path.pop()
//     }
//     return result
// }
// console.log(total([1, 2, 3, 4, 5], 3));