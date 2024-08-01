// 盛水最多的容器

let height = [1,8,6,2,5,4,8,3,7]

var maxArea = function(height) {
    let len = height.length
    let left = 0, right = len - 1
    let area, res
    while (left < right) { // 可以构成面积
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

console.log(maxArea(height));