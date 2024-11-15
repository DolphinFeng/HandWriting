// 搜索旋转排序数组

var search = function (nums, target) {
    // 二分法
    let start = 0;
    let end = nums.length - 1;

    while (start <= end) {
        // >> 1 相当于除以2向下取整
        let mid = (start + end) >> 1;

        if (nums[mid] === target) {
            return mid;
        }

        // 如果中间数小于最右边数，则右半段是有序的
        // 如果中间数大于最右边数，则左半段是有序的
        if (nums[mid] < nums[end]) {
            // 判断target是否在(mid, end]之间
            if (nums[mid] < target && target <= nums[end]) {
                // 如果在，则中间数右移即start增大
                start = mid + 1;
            } else {
                // 如果不在，则中间数左移即end减小
                end = mid - 1;
            }
        } else {
            // [start, mid)
            if (nums[start] <= target && target < nums[mid]) {
                end = mid - 1;
            } else {
                start = mid + 1;
            }
        }
    }

    return -1;
};

// 测试用例1: 旋转数组中存在目标值
const nums1 = [4,5,6,7,0,1,2];
const target1 = 0;
console.log(search(nums1, target1)); // 4

// 测试用例2: 旋转数组中不存在目标值
const nums2 = [4,5,6,7,0,1,2];
const target2 = 3;
console.log(search(nums2, target2)); // -1

// 测试用例3: 单个元素数组
const nums3 = [1];
const target3 = 0;
console.log(search(nums3, target3)); // -1

// 测试用例4: 两个元素的旋转数组
const nums4 = [3,1];
const target4 = 1;
console.log(search(nums4, target4)); // 1

// 测试用例5: 未旋转的有序数组
const nums5 = [1,2,3,4,5];
const target5 = 3;
console.log(search(nums5, target5)); // 2
