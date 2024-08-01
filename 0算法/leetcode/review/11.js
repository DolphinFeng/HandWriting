// 盛水最多的容器
// 核心思想：找到高度最小的，求出当前面积，如何移动指针？短的往中间移动

let height = [1,8,6,2,5,4,8,3,7]

function getMax (height) {
    let left = 0, right = height.length - 1
    let res = 0
    while (left < right) {
        let cur = (right - left) * Math.min(height[right], height[left])
        res = Math.max(res, cur)
        if (height[left] < height[right]) {
            left++
        } else {
            right--
        }
    }   
    return res
}

console.log(getMax(height));

// 双指针 时间复杂度 o(n)