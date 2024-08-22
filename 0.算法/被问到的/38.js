// B 站秋招笔试
/**
 * 计算停车场在给定的车辆进出顺序下的最大容量
 * @param {Array} In - 车辆进入停车场的顺序数组
 * @param {Array} Out - 车辆离开停车场的顺序数组
 * @returns {number} - 停车场的最大容量
 */
function parkingCapacity(In, Out) {
    // 初始化一个栈来模拟停车场
    const stack = [];
    // 初始化一个变量来记录停车场的最大容量
    let maxCapacity = 0;
    // 初始化一个索引来遍历出队列
    let outIndex = 0;

    // 遍历入队列
    for (const car of In) {
        // 将车入栈
        stack.push(car);
        // 更新最大容量
        maxCapacity = Math.max(maxCapacity, stack.length);

        // 检查栈顶元素是否与出队列的当前元素相同
        while (stack.length > 0 && stack[stack.length - 1] === Out[outIndex]) {
            // 如果相同，则出栈
            stack.pop();
            // 移动出队列的索引
            outIndex++;
        }
    }

    // 返回停车场的最大容量
    return maxCapacity;
}
