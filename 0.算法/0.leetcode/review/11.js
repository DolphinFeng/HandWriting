// 盛水最多的容器
// 核心思想：找到高度最小的，求出当前面积，如何移动指针？短的往中间移动

let height = [1,8,6,2,5,4,8,3,7]

function getMax (height) {
    let area = 0, max = 0
    let len = height.length
    let left = 0, right = len - 1
    while (left < right) {
        area = Math.min(height[left], height[right]) * (right - left) 
        max = Math.max(max, area)
        if (height[left] < height[right]) {
            left++
        } else {
            right--
        }
    }
    return max
}

console.log(getMax(height));

// 双指针 时间复杂度 o(n)