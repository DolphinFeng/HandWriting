// 百度校招二面
// 手写：写一个并发控制函数，和生成模拟请求列表函数33
/**
 * 并发执行任务函数
 * @param {Function[]} tasks - 任务数组，每个任务是一个返回 Promise 的函数
 * @param {Number} parallelCount - 并发数，表示同时运行的最大任务数
 * @returns {Promise} - 返回一个 Promise，当所有任务完成后执行 resolve
 */
function parallelTask(tasks, parallelCount = 2) {
    return new Promise((resolve, reject) => {
        let activeTasks = 0; // 当前正在执行的任务数
        let taskIndex = 0; // 当前任务索引
        const results = []; // 存储每个任务的结果

        // 运行任务的函数
        function runTask() {
            // 如果所有任务都已分配且没有活动任务，则完成
            if (taskIndex >= tasks.length) {
                if (activeTasks === 0) {
                    resolve(results); // 所有任务完成，执行 resolve
                }
                return;
            }

            const currentTaskIndex = taskIndex++; // 获取当前任务索引并递增
            activeTasks++; // 增加活动任务数

            // 执行当前任务
            tasks[currentTaskIndex]()
                .then(result => {
                    results[currentTaskIndex] = result; // 存储任务结果
                    activeTasks--; // 任务完成，减少活动任务数
                    runTask(); // 继续运行下一个任务
                })
                .catch(error => {
                    reject(error); // 任务出错，执行 reject
                });

            // 如果活动任务数小于并发数，继续运行下一个任务
            if (activeTasks < parallelCount) {
                runTask();
            }
        }

        // 初始化并发任务
        for (let i = 0; i < parallelCount && i < tasks.length; i++) {
            runTask();
        }
    });
}



// 模拟任务函数，返回一个 Promise，模拟异步操作
function createTask(id, duration) {
    return function() {
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log(`任务 ${id} 完成，耗时 ${duration}ms`);
                resolve(`结果 ${id}`);
            }, duration);
        });
    };
}

// 创建任务数组
const tasks = [
    createTask(1, 1000),
    createTask(2, 500),
    createTask(3, 1500),
    createTask(4, 2000),
    createTask(5, 800),
    createTask(6, 1200),
    createTask(7, 700),
    createTask(8, 300),
    createTask(9, 900),
    createTask(10, 400)
];


// 并发执行任务
parallelTask(tasks, 2).then(results => {
    console.log('所有任务完成:', results);
}).catch(error => {
    console.error('任务执行出错:', error);
});
