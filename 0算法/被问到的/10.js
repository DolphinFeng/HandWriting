// 给定一个由n个正整数组成数组，并指定一个结果m，求出将n个正整数通过相加或者相减的方式，得到结果m的组合方式有多少种?
// 例:数组:[1,1,1,1,1],结果:3  组合方式:
// 1+1+1+1-1=3
// 1+1+1-1+1=3
// 1+1-1+1+1=3
// 1-1+1+1+1-3
// -1+1+1+1+1=3
// 一共有5种组合方式


function total(nums, m, path = [], result = [], nowindex = 0) {
    if (nowindex === nums.length) {
        // console.log(path.reduce((a,b)=>a+b,0));
        // console.log(path);
        if (path.reduce((a, b) => a + b, 0) === m) {
            result.push([path.join(',')])
            return result;
        }
        return
    }
    for (let i = nowindex, j = 0; j < 2; j++) {
        path.push(nums[i])
        nums[i] = -nums[i]
        total(nums, m, path, result, nowindex + 1)
        path.pop()
    }
    return result
}
console.log(total([1, 2, 3, 4, 5], 3));