// 给定一个由n个正整数组成数组，并指定一个结果m，求出将n个正整数通过相加或者相减的方式，得到结果m的组合方式有多少种?
// 例:数组:[1,1,1,1,1],结果:3  组合方式:
// 1+1+1+1-1=3
// 1+1+1-1+1=3
// 1+1-1+1+1=3
// 1-1+1+1+1-3
// -1+1+1+1+1=3
// 一共有5种组合方式

function findTargetSumWays (nums, S) {
    let count = 0
    
    function calculate (nums, i, sum, S) {
        if (i === nums.length) {
            if (sum === S) {
                count++
            }
        } else {
            calculate(nums, i + 1, sum + nums[i], S)
            calculate(nums, i + 1, sum - nums[i], S)
        }
    }
    calculate (nums, 0, 0, S)
    return count
}

const nums = [1, 1, 1, 1, 1];
const S = 3;
console.log(findTargetSumWays(nums, S)); // 输出: 5