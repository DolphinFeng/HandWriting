// 给定 n 个非负整数表示每个宽度为 1 的柱子的高度图，计算按此排列的柱子，下雨之后能接多少雨水。

let height = [0,1,0,2,1,0,1,3,2,1,2,1] // 6

// let height = [4,2,0,3,2,5] // 9

function trap(height) {
    // 如果高度数组为空，直接返回0
    if (height.length === 0) return 0;

    let left = 0, right = height.length - 1; // 定义左右指针
    let leftMax = 0, rightMax = 0; // 定义左右最大高度
    let water = 0; // 用于存储总的雨水量

    // 当左指针小于右指针时，进行循环
    while (left < right) {
        if (height[left] < height[right]) {
            // 如果左边的高度小于右边的高度
            if (height[left] >= leftMax) {
                // 更新左边最大高度
                leftMax = height[left];
            } else {
                // 计算左边能接的雨水
                water += leftMax - height[left];
            }
            left++; // 移动左指针
        } else {
            // 如果右边的高度小于或等于左边的高度
            if (height[right] >= rightMax) {
                // 更新右边最大高度
                rightMax = height[right];
            } else {
                // 计算右边能接的雨水
                water += rightMax - height[right];
            }
            right--; // 移动右指针
        }
    }

    return water; // 返回总的雨水量
}

console.log(trap(height)); // 输出 9