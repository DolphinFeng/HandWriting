// 84. 柱状图中最大的矩形

const largestRectangleArea = (heights) => {
    let maxArea = 0
    const stack = []
    heights = [0, ...heights, 0]
    for (let i = 0; i < heights.length; i++) {
        while (heights[i] < heights[stack[stack.length - 1]]) { // 当前bar比栈顶bar矮
            const stackTopIndex = stack.pop() // 栈顶元素出栈，并保存栈顶bar的索引
            maxArea = Math.max(               // 计算面积，并挑战最大面积
                maxArea,                        // 计算出栈的bar形成的长方形面积
                heights[stackTopIndex] * (i - stack[stack.length - 1] - 1)
            )
        }
        stack.push(i)                       // 当前bar比栈顶bar高了，入栈
    }
    return maxArea
}

// 示例 1
let heights1 = [2,1,5,6,2,3];
console.log(largestRectangleArea(heights1)); // 输出: 10
/*
heights1 = [2,1,5,6,2,3]
          ___
         |   |
     ___ |   |
    |   ||   |    ___
___ |   ||   |___|   |
|   ||   ||   ||   ||   |
|   ||   ||   ||   ||   |
2   1   5   6   2   3

最大矩形面积为 5 * 2 = 10 (高度为2，宽度为5)
*/

// 示例 2
let heights2 = [2,4];
console.log(largestRectangleArea(heights2)); // 输出: 4

// 示例 3
let heights3 = [1,1];
console.log(largestRectangleArea(heights3)); // 输出: 2

// 示例 4
let heights4 = [2,1,2];
console.log(largestRectangleArea(heights4)); // 输出: 3

// 示例 5
let heights5 = [5,4,1,2];
console.log(largestRectangleArea(heights5)); // 输出: 8

// 示例 6
let heights6 = [1,2,3,4,5];
console.log(largestRectangleArea(heights6)); // 输出: 9
