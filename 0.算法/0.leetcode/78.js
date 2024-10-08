// 子集

// 给你一个整数数组 nums ，数组中的元素 互不相同 。返回该数组所有可能的
// 子集
// （幂集）。

// 解集 不能 包含重复的子集。你可以按 任意顺序 返回解集。

 

// 示例 1：

// 输入：nums = [1,2,3]
// 输出：[[],[1],[2],[1,2],[3],[1,3],[2,3],[1,2,3]]
// 示例 2：

// 输入：nums = [0]
// 输出：[[],[0]]

function subsets (nums) {
    let res = [];
    
    const dfs = (index, path) => {
        res.push(path);
        for (let i = index; i < nums.length; i++) {
            dfs(i + 1, path.concat(nums[i]));
        }
    }
    
    dfs(0, []);
    return res;
};


let nums = [1, 2, 3];
console.log(subsets(nums));