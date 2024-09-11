// 全排列：给定一个不含重复数字的数组 nums ，返回其 所有可能的全排列 。你可以 按任意顺序 返回答案。
let nums = [1,2,3] // [[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]
// let nums = [0,1] // [[0,1],[1,0]]
// let nums = [1] // [[1]]
function permute(nums) {
    // 初始化结果数组
    let result = [];

    // 定义回溯函数
    function backtrack(path, options) {
        // 如果没有更多的选项，说明当前路径是一个完整的排列
        if (options.length === 0) {
            result.push(path); // 将当前路径加入结果数组
            return;
        }

        // 遍历所有选项
        for (let i = 0; i < options.length; i++) {
            // 递归调用回溯函数，更新路径和选项
            backtrack(
                path.concat(options[i]), // 将当前选项加入路径
                options.slice(0, i).concat(options.slice(i + 1)) // 去掉当前选项，生成新的选项数组
            );
        }
    }

    // 开始回溯，初始路径为空，选项为输入数组
    backtrack([], nums);

    // 返回结果数组
    return result;
}
console.log(permute(nums));