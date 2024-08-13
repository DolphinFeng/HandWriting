// 盛水最多的容器

let height = [1,8,6,2,5,4,8,3,7]

/**
 * 计算能够盛水的最大面积
 * @param {number[]} height - 每个位置的高度
 * @return {number} - 能够盛水的最大面积
 */
var maxArea = function(height) {
    let len = height.length
    let left = 0, right = len - 1
    let area, res = 0 // 初始化最大面积为0
    while (left < right) { // 当左右指针没有相遇时
        // 计算当前左右指针构成的面积
        area = (right - left) * Math.min(height[left], height[right])
        // 更新最大面积
        res = Math.max(res, area)
        // 移动较小高度的指针，以期望找到更大的面积
        if (height[left] < height[right]) {
            left++
        } else {
            right--
        }
    }
    return res // 返回最大面积
};

console.log(maxArea(height)); // 输出最大面积
