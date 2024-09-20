// 删除有序数组中的重复项

function removeDuplicates(nums) {
    var x = 1
    for (var i = 1; i < nums.length; i++) {
        if (nums[i] !== nums[i - 1]) {
            nums[x] = nums[i]
            x++
        }
    }
    return x
};

let nums = [1, 1, 2]
console.log(removeDuplicates(nums));

