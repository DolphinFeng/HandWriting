// 两数之和
let nums = [2,7,11,15]

// 暴力
// function twoSum(arr, target) {
//     for(let i = 0; i < arr.length; i++) {
//         for(let j = i + 1; j < arr.length; j++) {
//             if (arr[i] + arr[j] === target) {
//                 return [i, j]
//             }
//         }
//     }
// }

/**
 * 使用哈希表查找两数之和
 * @param {number[]} arr - 输入的数组
 * @param {number} target - 目标和
 * @returns {number[]} - 返回两个数的索引
 */
function twoSum(arr, target) {
    let obj = {};
    for (let i = 0; i < arr.length; i++) {
        if (obj[target - arr[i]] !== undefined) {
            return [obj[target - arr[i]], i];
        } else {
            obj[arr[i]] = i;
        }
    }
}

// 输出结果，测试函数
console.log(twoSum(nums, 9)); // [0, 1]
