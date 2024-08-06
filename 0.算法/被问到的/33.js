// 百度校招二面
// 手写：写一个并发控制函数，和生成模拟请求列表函数
/**
 * 题目：要求实现一个并发执行任务函数，给定任务数组和并发数，返回一个 Promise，当所有任务完成后执行resolve
 * @params {Function[]} tasks
 * @params {Number} parallelCount
 */
function parallelTask(tasks, parallelCount = 2) {
}
/**
* 生成任务函数，要求生成任务数组
* @param {Number} taskCount 
* @param {Function} taskCallback 
*/
function randomTask(taskCount, taskCallback) {
 return tasks
}
let tasks = randomTask(100, time => {
 console.log(`任务执行完成耗时${time}ms`);
});
parallelTask(tasks, 2);
