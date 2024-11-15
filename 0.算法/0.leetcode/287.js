// 287. 寻找重复数

const findDuplicate = (nums) => {
    let slow = 0;
    let fast = 0;
    while (true) {
        slow = nums[slow];
        fast = nums[nums[fast]];   // slow跳一步，fast跳两步
        if (slow == fast) {        // 指针首次相遇
            fast = 0;              // 让快指针回到起点
            while (true) {         // 开启新的循环
                if (slow == fast) {// 如果再次相遇，就肯定是在入口处
                    return slow;   // 返回入口，即重复的数
                }
                slow = nums[slow]; // 两个指针每次都进1步
                fast = nums[fast];
            }
        }
    }
};

// 示例 1
let nums1 = [1,3,4,2,2];
console.log(findDuplicate(nums1)); // 输出: 2
// 解释：数组中有 n + 1 = 5 个整数，其中 2 出现了两次

// 示例 2
let nums2 = [3,1,3,4,2];
console.log(findDuplicate(nums2)); // 输出: 3
// 解释：3 出现了两次

// 示例 3
let nums3 = [1,1];
console.log(findDuplicate(nums3)); // 输出: 1
// 解释：1 出现了两次

// 示例 4
let nums4 = [1,1,2];
console.log(findDuplicate(nums4)); // 输出: 1
// 解释：1 出现了两次
