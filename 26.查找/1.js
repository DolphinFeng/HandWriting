// 二分查找：数据必须先是有序的

let nums = [-1, 0, 3, 5, 9, 12] // 找到目标值为9的下标

/**
 * 在有序数组中查找目标值的下标
 * @param {number[]} nums - 有序数组
 * @param {number} target - 目标值
 * @return {number} - 目标值的下标，若未找到返回-1
 */
function search(nums, target) {
    let mid, left = 0
    let right = nums.length - 1
    // 当左指针小于等于右指针时，继续查找
    while (left <= right) {
        // 计算中间位置，防止溢出
        mid = left + ((right - left) >> 1)
        // 如果目标值大于中间值，移动左指针
        if (target > nums[mid]) {
            left = mid + 1
        } else if (target < nums[mid]) {
            // 如果目标值小于中间值，移动右指针
            right = mid - 1
        } else {
            // 找到目标值，返回下标
            return mid
        }
    }
    // 未找到目标值，返回-1
    return -1
}

console.log(search(nums, 9)) // 输出目标值9的下标
