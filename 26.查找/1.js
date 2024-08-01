// 二分查找：数据必须先是有序的

let nums = [-1, 0, 3, 5, 9, 12]//找到目标值为9的下标

function search (nums, target) {
    let mid, left = 0
    let right = nums.length - 1
    while (left <= right) {
        mid = left + ((right - left) >> 1)
        if (target > nums[mid]) {
            left = mid + 1
        } else
            if (target < nums[mid]) {
                right = mid - 1
            }
            else {
                return mid
            }
    }
    return -1
};

console.log(search(nums,9))
