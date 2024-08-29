// 三数之和  t 神字节三面
// 给你一个整数数组 nums ，判断是否存在三元组 [nums[i], nums[j], nums[k]] 满足 i != j、i != k 且 j != k ，
// 同时还满足 nums[i] + nums[j] + nums[k] == 0 。请你返回所有和为 0 且不重复的三元组。

// let nums = [-1,0,1,2,-1,-4] // [[-1,-1,2],[-1,0,1]]
// let nums = [0,1,1] // []
let nums = [0,0,0] // [0,0,0]

function threeSum(nums) {
    nums.sort((a, b) => a - b); // 排序数组
    let res = []; // 初始化结果数组

    for (let i = 0; i < nums.length - 2; i++) {
        if (i > 0 && nums[i] === nums[i - 1]) continue; // 跳过重复元素
        let left = i + 1;
        let right = nums.length - 1;

        while (left < right) {
            let sum = nums[i] + nums[left] + nums[right];
            if (sum === 0) {
                res.push([nums[i], nums[left], nums[right]]);
                while (left < right && nums[left] === nums[left + 1]) left++; // 跳过重复元素
                while (left < right && nums[right] === nums[right - 1]) right--; // 跳过重复元素
                left++;
                right--;
            } else if (sum < 0) {
                left++;
            } else {
                right--;
            }
        }
    }

    return res; // 返回结果
}

console.log(threeSum(nums));