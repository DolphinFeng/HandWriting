// 百度校招二面
// 手写：写一个并发控制函数，和生成模拟请求列表函数33
/**
 * 并发执行任务函数
 * @param {Function[]} tasks - 任务数组，每个任务是一个返回 Promise 的函数
 * @param {Number} max - 并发数，表示同时运行的最大任务数
 * @returns {Promise} - 返回一个 Promise，当所有任务完成后执行 resolve
 */
function parallelTask (tasks, max) {
    return new Promise((resolve, reject) => {
        let aTasks = 0;
        let index = 0;
        const results = []
        function runTask () {
            if (index >= tasks.length) {
                if (aTasks === 0) {
                    resolve(results)
                }
                return
            }

            const curIndex = index++;
            aTasks++;
            tasks[curIndex]()
            .then(result => {
                results[curIndex] = result;
                aTasks--;
                runTask();
            })
            .catch(error => {
                reject(error)
            })

            if (aTasks < max) {
                runTask()
            }
        }

        for (let i = 0; i < max && i < tasks.length; i++) {
            runTask()
        }
    })
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
