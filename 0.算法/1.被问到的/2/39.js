// 基于时间分片机制求数字和，在执行累加计算时，单次处理的时间不得超过 15 ms，函数应采用分批处理的方式，每次在 15ms 内尽可能地完成累加操作，然后使剩余任务推迟到下一次宏任务中执行，直到累加完成，累加完成后返回最终累加和
// 不能使用计算公式一次性算出 (n*(n+1))/2，必须模拟逐步累加的过程

function calculateSum (n) {
    // 定义一个Promise，确保在累加完成后返回最终的累加和
    return new Promise((resolve) => {
        let sum = 0; // 初始化累加和为0
        let current = 1; // 初始化当前累加的数字为1

        // 定义一个函数，用于执行分批累加操作
        function batchAdd() {
            const start = performance.now(); // 记录当前时间

            // 在15毫秒内尽可能多地进行累加操作
            while (current <= n && performance.now() - start < 15) {
                sum += current;
                current++;
            }

            // 如果当前累加的数字小于等于n，说明还有未完成的累加操作
            if (current <= n) {
                // 使用宏任务机制，将剩余的累加操作推迟到下一次宏任务中执行
                setTimeout(batchAdd, 0);
            } else {
                // 如果累加完成，返回最终的累加和
                resolve(sum);
            }
        }

        // 开始第一次的分批累加操作
        batchAdd();
    });
}

calculateSum(1000000).then(sum => {
    console.log('Sum: ', sum); // 500000500000
});
