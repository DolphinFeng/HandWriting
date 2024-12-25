// 496. 下一个更大元素 I

let nextGreaterElement = function(nums1, nums2) {
    let map = new Map(), stack = [], ans = [];
  //循环nums2，如果循环的元素大于栈顶元素，并且栈不为空，则不断将栈顶元素作为key，当前元素作为value加入map中
  //本质是第一个比栈顶元素大的值会让栈中的元素不断出队 所以这个数就是这些出栈元素的下一个更大的数
    nums2.forEach(item => {
        while(stack.length && item > stack[stack.length-1]){
            map.set(stack.pop(), item)
        };
        stack.push(item);
    });
    stack.forEach(item => map.set(item, -1));//剩下来的元素就是没有找到最大值的
    nums1.forEach(item => ans.push(map.get(item)));//遍历nums1将结果推入ans中
    return ans;
};

console.log(nextGreaterElement([4,1,2], [1,3,4,2])) // [-1,3,-1];
