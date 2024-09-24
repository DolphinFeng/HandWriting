// 最长连续递增序列

function findLengthOfLCI (nums) {
    if(nums.length < 2) {
        return nums.length
    }

    let left = 0, cur = 0, right = 1, len = 1
    while(right < nums.length) {
        if(nums[right] <= nums[cur]) {
            left = right
        }

        len = Math.max(len, right - left + 1)
        cur++
        right++
    }
    return len
}

let nums = [1, 3, 5, 4, 7]
console.log(findLengthOfLCI(nums));
