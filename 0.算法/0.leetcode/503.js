// 下一个更大元素 II

var nextGreaterElements = function(nums) {
    let stack = [], res = new Array(nums.length).fill(-1), downIndex = 0
    for(let i = 0; i < nums.length; i++) {
        while(stack.length!=0 && stack[stack.length-1][1] < nums[i]){
            res[stack.pop()[0]] = nums[i]
        }
        if(stack.length === 0) {
            downIndex = i
        }
        stack.push([i, nums[i]])
    }
    while(stack.length > 0){
        let indexNum = stack.pop()
        for(let j = 0; j <= downIndex; j++){
            if(indexNum[1] < nums[j]){
                res[indexNum[0]] = nums[j]
                break
            }
        }
    }
    return res
};

console.log(nextGreaterElements([1,2,1])) // [2,-1,2]
console.log(nextGreaterElements([1,2,3,4,3])) // [2,3,4,-1,4]