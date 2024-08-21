// 百度校招二面
// 手写：写一个并发控制函数，和生成模拟请求列表函数33
/**
 * 并发执行任务函数
 * @param {Function[]} tasks - 任务数组，每个任务是一个返回 Promise 的函数
 * @param {Number} parallelCount - 并发数，表示同时运行的最大任务数
 * @returns {Promise} - 返回一个 Promise，当所有任务完成后执行 resolve
 */
function parallelTask (tasks, parallelCount) {
    return new Promise((resolve, reject) => {
        let activeTasks = 0
        let taskIndex = 0
        const results = []
        function runTask () {
            if (taskIndex >= tasks.length) {
                if (activeTasks === 0) {
                    resolve(results)
                }
                return
            }
            const currentTaskIndex = taskIndex++
            activeTasks++
            tasks[currentTaskIndex]()
            .then(res => {
                results[currentTaskIndex] = res
                activeTasks--
                runTask()
            })
            .catch(err => {
                reject(err)
            })

            if (activeTasks < parallelCount) {
                runTask()
            }
        }

        for (let i = 0; i < parallelCount && i < tasks.length; i++) {
            runTask()
        }
    })
}

