let nums = [-1, 0, 3, 5, 9, 12]

function find (nums, target) {
    let left = 0, right = nums.length - 1
    while (left <= right) {
        let mid = left + ((right - left) >> 1)
        if (target > nums[mid]) {
            left = mid + 1 
        } else if (target < nums[mid]) {
            right = mid - 1
        } else {
            return mid
        }
    }
    return -1
}

console.log(find(nums, 9));