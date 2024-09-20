// 四数之和

function fourSum (nums, target) {
    const res = [];
    if (nums.length < 4) return res;

    nums.sort((x, y) => x - y);
    const length = nums.length;
    for (let i = 0; i < length - 3; i++) {
        // 第一个指针的数字去重
        if (i > 0 && nums[i] === nums[i - 1]) continue;
        // 由于数组已经排序，选出最小的四个数都已经大于了 target，后面不会找到 等于 target 的组合了
        if (nums[i] + nums[i + 1] + nums[i + 2] + nums[i + 3] > target) break;
        // 由于数组已经排序，选出最大的四个数都已经小于了 target，后面不会找到 等于 target 的组合了
        if (nums[i] + nums[length - 3] + nums[length - 2] + nums[length - 1] < target) continue;

        for (let j = i + 1; j < length - 2; j++) {
            // 第二个指针的数字去重
            if (j > i + 1 && nums[j] === nums[j - 1]) continue;
            // 由于数组已经排序，选出最小的四个数都已经大于了 target，后面不会找到 等于 target 的组合了
            if (nums[i] + nums[j] + nums[j + 1] + nums[j + 2] > target) break;
            // 由于数组已经排序，选出最大的四个数都已经小于了 target，后面不会找到 等于 target 的组合了
            if (nums[i] + nums[j] + nums[length - 2] + nums[length - 1] < target) continue;

            let left = j + 1, right = length - 1;
            while (left < right) {
                const sum = nums[i] + nums[j] + nums[left] + nums[right];
                if (sum === target) {
                    res.push([nums[i], nums[j], nums[left], nums[right]]);
                    while (left < right && nums[left] === nums[left + 1]) left++;
                    left++;
                    while (left < right && nums[right] === nums[right - 1]) right--;
                    right--;
                } else if (sum < target) {
                    left++;
                } else {
                    right--;
                }
            }
        }
    }

    return res;
};

let nums = [1, 0, -1, 0, -2, 2];
console.log(fourSum(nums, 0)); 