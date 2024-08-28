// 打印数组全排列，[1,2,3] 打印[[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]

/**
 * 生成给定数组的全排列
 * @param {number[]} nums - 输入的数组
 * @returns {number[][]} - 返回数组的全排列
 */
function permute(nums) {
    const result = []; // 存储最终的全排列结果
    
    /**
     * 回溯算法生成全排列
     * @param {number[]} path - 当前排列路径
     * @param {number[]} options - 剩余可选的数字
     */
    function backtrack(path, options) {
        if (options.length === 0) { // 如果没有剩余的数字可选，说明当前路径是一个完整排列
            result.push(path); // 将当前路径加入结果集
            return;
        }
        
        for (let i = 0; i < options.length; i++) { // 遍历所有可选数字
            // 递归调用，生成新的路径和剩余可选数字
            backtrack(path.concat(options[i]), options.slice(0, i).concat(options.slice(i + 1)));
        }
    }
    
    backtrack([], nums); // 从空路径和完整的输入数组开始回溯
    return result; // 返回最终的全排列结果
}

console.log(permute([1, 2, 3])); // 打印全排列结果
