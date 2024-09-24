// 给定 n 个非负整数表示每个宽度为 1 的柱子的高度图，计算按此排列的柱子，下雨之后能接多少雨水。

let height = [0,1,0,2,1,0,1,3,2,1,2,1] // 6

// let height = [4,2,0,3,2,5] // 9

// 长方形 = left + right - 柱子 - 雨水  ->  雨水 = left + right - 柱子 - 长方形
// 左边就是有光源从每个柱子的左边开始照射，右边就是有光源从每个柱子的右边开始照射

var trap = function(height) {
    let l_max = 0, r_max = 0, ans = 0;
    for (let i = 0; i < height.length; i++) {
        l_max = Math.max(l_max, height[i]);
        r_max = Math.max(r_max, height[height.length - i - 1]);
        ans += l_max + r_max - height[i];
    }
    return ans - l_max * height.length;
}
console.log(trap(height));