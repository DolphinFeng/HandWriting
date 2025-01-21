// 2239. 找到最接近 0 的数字

var findClosestNumber = function(nums) {
    let minDist = Infinity;  // 记录最小距离
    let result = 0;         // 记录结果
    
    // 遍历数组
    for (let num of nums) {
        let dist = Math.abs(num);  // 计算到0的距离
        
        // 如果找到更小的距离，更新结果
        if (dist < minDist) {
            minDist = dist;
            result = num;
        } 
        // 如果距离相等，取较大的数
        else if (dist === minDist && num > result) {
            result = num;
        }
    }
    
    return result;
};

// let nums = [-4,-2,1,4,8];
let nums = [2,-1,1];
console.log(findClosestNumber(nums)); 
