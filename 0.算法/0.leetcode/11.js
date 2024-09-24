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
    let area, res = 0 
    while (left < right) { 
        area = (right - left) * Math.min(height[left], height[right])
        res = Math.max(res, area)
        if (height[left] < height[right]) {
            left++
        } else {
            right--
        }
    }
    return res 
};

console.log(maxArea(height)); // 输出最大面积
