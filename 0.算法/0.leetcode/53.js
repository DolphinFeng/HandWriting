// 最大数组和

// 给你一个整数数组 nums ，请你找出一个具有最大和的连续子数组（子数组最少包含一个元素），返回其最大和。

// 子数组
// 是数组中的一个连续部分。

 

// 示例 1：

// 输入：nums = [-2,1,-3,4,-1,2,1,-5,4]
// 输出：6
// 解释：连续子数组 [4,-1,2,1] 的和最大，为 6 。
// 示例 2：

// 输入：nums = [1]
// 输出：1
// 示例 3：

// 输入：nums = [5,4,-1,7,8]
// 输出：23

var maxSubArray = function(nums) {
    let ans = nums[0];
    let sum = 0;
    for(const num of nums) {
        if(sum > 0) {
            sum += num;
        } else {
            sum = num;
        }
        ans = Math.max(ans, sum);
    }
    return ans;
};

 
console.log(maxSubArray([-2, 1, -3, 4, -1, 2, 1, -5, 4])); // 输出: 6
console.log(maxSubArray([1])); // 输出: 1
console.log(maxSubArray([5, 4, -1, 7, 8])); // 输出: 23
console.log(maxSubArray([-1, -2, -3, -4])); // 输出: -1
console.log(maxSubArray([1, 2, 3, 4])); // 输出: 10
console.log(maxSubArray([0])); // 输出: 0
console.log(maxSubArray([0, -3, 1, 1])); // 输出: 2
console.log(maxSubArray([0, 2, 3, -2, 4])); // 输出: 7