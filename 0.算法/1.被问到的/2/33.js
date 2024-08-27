/**
 * 生成任务函数，要求生成任务数组
 * @param {Number} taskCount - 任务数量
 * @param {Function} taskCallback - 任务回调函数
 * @returns {Array} 任务数组
 */
function randomTask(taskCount, taskCallback) {
    const tasks = [];
    for (let i = 0; i < taskCount; i++) {
        tasks.push(() => {
            const time = Math.floor(Math.random() * 1000);
            taskCallback(time);
        });
    }
    return tasks;
}

let tasks = randomTask(100, time => {
    console.log(`任务执行完成耗时${time}ms`);
});