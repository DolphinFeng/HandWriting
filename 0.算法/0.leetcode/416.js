// 416. 分割等和子集

const canPartition = (nums) => {
    let sum = 0;
    for (const n of nums) { // 求数组和
        sum += n;
    }
    if (sum % 2 != 0) return false; // 如果 sum 为奇数，直接返回 false
    const memo = new Map();
    const target = sum / 2; // 目标和

    const dfs = (curSum, i) => {    // curSum是当前累加和，i是指针
        if (i == nums.length || curSum > target) { // 递归的出口
            return false;
        }
        if (curSum == target) {                    // 递归的出口
            return true;
        }
        const key = curSum + '&' + i;   // 描述一个问题的key
        if (memo.has(key)) {            // 如果memo中有对应的缓存值，直接使用
            return memo.get(key);
        }
        const res = dfs(curSum + nums[i], i + 1) || dfs(curSum, i + 1);
        memo.set(key, res);  // 计算的结果存入memo
        return res;
    };

    return dfs(0, 0); // 递归的入口，当前和为0，指针为0
};


// test cases
console.log(canPartition([1, 5, 11, 5])); // true
// 解释：数组可以分割成 [1, 5, 5] 和 [11]

console.log(canPartition([1, 2, 3, 5])); // false
// 解释：数组不能分割成两个元素和相等的子集

console.log(canPartition([1, 2, 5])); // false

console.log(canPartition([2, 2, 1, 1])); // true
// 解释：数组可以分割成 [2, 2] 和 [1, 1]
