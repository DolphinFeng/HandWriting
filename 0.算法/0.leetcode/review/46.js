// 全排列：给定一个不含重复数字的数组 nums ，返回其 所有可能的全排列 。你可以 按任意顺序 返回答案。
let nums = [1,2,3] // [[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]
// let nums = [0,1] // [[0,1],[1,0]]
// let nums = [1] // [[1]]
function permute (nums) {
    let res = []
    function backtrack (path, options) {
        if (!options.length) {
            res.push(path)
            return 
        }
        for (let i = 0; i < options.length; i++) {
            backtrack(
                path.concat(options[i]),
                options.slice(0, i).concat(options.slice(i + 1))
            )
        }
    }
    backtrack([], nums)
    return res
}


console.log(permute(nums));