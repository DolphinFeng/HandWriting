// 347. 前 K 个高频元素

/**
 * @param {number[]} nums
 * @param {number} k
 * @return {number[]}
 */
var topKFrequent = function (nums, k) {
    const map = new Map();
    nums.forEach(n => {
        map.set(n, map.has(n) ? map.get(n) + 1 : 1);
    });
    // 先将 map 转化为 Array
    const list = Array.from(map).sort((a, b) => b[1] - a[1]);
    // 只取元素值
    return list.slice(0, k).map(n => n[0]);
};

// 示例 1
let nums1 = [1,1,1,2,2,3];
let k1 = 2;
console.log(topKFrequent(nums1, k1)); // 输出: [1,2]
/*
[1,1,1,2,2,3]
1 出现 3 次
2 出现 2 次  
3 出现 1 次
因此前 2 个高频元素是 [1,2]
*/

// 示例 2
let nums2 = [1];
let k2 = 1;
console.log(topKFrequent(nums2, k2)); // 输出: [1]

// 示例 3
let nums3 = [1,2];
let k3 = 2;
console.log(topKFrequent(nums3, k3)); // 输出: [1,2]

// 示例 4
let nums4 = [4,1,-1,2,-1,2,3];
let k4 = 2;
console.log(topKFrequent(nums4, k4)); // 输出: [-1,2]
