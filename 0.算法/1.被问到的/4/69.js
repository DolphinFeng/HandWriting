// 给一个非负整数数组，最初位于数组的第一个下标，数组中的每个元素代表在该位置跳跃的最大长度，判断是否能到达最后一个 leetcode 55 云智一面

function canJump(nums) {
    let maxReach = 0;
    for (let i = 0; i < nums.length; i++) {
        if (i > maxReach) {
            return false; // 当前下标超过了能到达的最远位置
        }
        maxReach = Math.max(maxReach, i + nums[i]);
    }
    return maxReach >= nums.length - 1;
}

// 示例用法:
console.log(canJump([2, 3, 1, 1, 4])); // 输出: true
console.log(canJump([3, 2, 1, 0, 4])); // 输出: false
console.log(canJump([0])); // 输出: true
console.log(canJump([2, 0, 0])); // 输出: true
console.log(canJump([1, 1, 1, 1, 1])); // 输出: true