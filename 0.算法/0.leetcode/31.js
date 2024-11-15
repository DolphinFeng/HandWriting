// 31. 下一个排列

function nextPermutation(nums) {
    let i = nums.length - 2;                   // 向左遍历，i从倒数第二开始是为了nums[i+1]要存在
    while (i >= 0 && nums[i] >= nums[i + 1]) { // 寻找第一个小于右邻居的数
        i--;
    }
    if (i >= 0) {                             // 这个数在数组中存在，从它身后挑一个数，和它换
        let j = nums.length - 1;                // 从最后一项，向左遍历
        while (j >= 0 && nums[j] <= nums[i]) {  // 寻找第一个大于 nums[i] 的数
            j--;
        }
        [nums[i], nums[j]] = [nums[j], nums[i]]; // 两数交换，实现变大
    }
    // 如果 i = -1，说明是递减排列，如 3 2 1，没有下一排列，直接翻转为最小排列：1 2 3
    let l = i + 1;
    let r = nums.length - 1;
    while (l < r) {                            // i 右边的数进行翻转，使得变大的幅度小一些
        [nums[l], nums[r]] = [nums[r], nums[l]];
        l++;
        r--;
    }
}

// 示例 1
let nums1 = [1,2,3];
console.log(nextPermutation(nums1)); // 输出: [1,3,2]
// 解释：下一个更大的排列是 [1,3,2]

// 示例 2
let nums2 = [3,2,1];
console.log(nextPermutation(nums2)); // 输出: [1,2,3]
// 解释：3,2,1 已经是最大的排列，下一个排列是最小的排列 [1,2,3]

// 示例 3
let nums3 = [1,1,5];
console.log(nextPermutation(nums3)); // 输出: [1,5,1]
// 解释：下一个更大的排列是 [1,5,1]

// 示例 4
let nums4 = [1];
console.log(nextPermutation(nums4)); // 输出: [1]
// 解释：只有一个元素，没有下一个排列