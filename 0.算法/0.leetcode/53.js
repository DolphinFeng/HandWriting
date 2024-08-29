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
    // 初始化两个变量，`maxSum` 和 `currentSum`
    // `maxSum` 用于存储当前找到的最大子数组和
    // `currentSum` 用于存储当前子数组的和
    let maxSum = nums[0];
    let currentSum = nums[0];

    // 从数组的第二个元素开始遍历
    for (let i = 1; i < nums.length; i++) {
        // 更新 `currentSum`，如果 `currentSum` 加上当前元素 `nums[i]` 还不如 `nums[i]` 本身大，
        // 那么就把 `currentSum` 更新为 `nums[i]`
        currentSum = Math.max(nums[i], currentSum + nums[i]);

        // 更新 `maxSum`，如果 `currentSum` 大于 `maxSum`，则更新 `maxSum`
        maxSum = Math.max(maxSum, currentSum);
    }

    // 返回找到的最大子数组和
    return maxSum;
};

 
console.log(maxSubArray([-2, 1, -3, 4, -1, 2, 1, -5, 4])); // 输出: 6
console.log(maxSubArray([1])); // 输出: 1
console.log(maxSubArray([5, 4, -1, 7, 8])); // 输出: 23
console.log(maxSubArray([-1, -2, -3, -4])); // 输出: -1
console.log(maxSubArray([1, 2, 3, 4])); // 输出: 10
console.log(maxSubArray([0])); // 输出: 0
console.log(maxSubArray([0, -3, 1, 1])); // 输出: 2
console.log(maxSubArray([0, 2, 3, -2, 4])); // 输出: 7