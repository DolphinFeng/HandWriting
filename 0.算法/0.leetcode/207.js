// 课程表


const canFinish = (numCourses, prerequisites) => {
    const inDegree = new Array(numCourses).fill(0); // 入度数组
    const map = {};                                 // 邻接表
    for (let i = 0; i < prerequisites.length; i++) {
        inDegree[prerequisites[i][0]]++;              // 求课的初始入度值
        if (map[prerequisites[i][1]]) {               // 当前课已经存在于邻接表
            map[prerequisites[i][1]].push(prerequisites[i][0]); // 添加依赖它的后续课
        } else {                                      // 当前课不存在于邻接表
            map[prerequisites[i][1]] = [prerequisites[i][0]];
        }
    }
    const queue = [];
    for (let i = 0; i < inDegree.length; i++) { // 所有入度为0的课入列
        if (inDegree[i] == 0) queue.push(i);
    }
    let count = 0;
    while (queue.length) {
        const selected = queue.shift();           // 当前选的课，出列
        count++;                                  // 选课数+1
        const toEnQueue = map[selected];          // 获取这门课对应的后续课
        if (toEnQueue && toEnQueue.length) {      // 确实有后续课
            for (let i = 0; i < toEnQueue.length; i++) {
                inDegree[toEnQueue[i]]--;             // 依赖它的后续课的入度-1
                if (inDegree[toEnQueue[i]] == 0) {    // 如果因此减为0，入列
                    queue.push(toEnQueue[i]);
                }
            }
        }
    }
    return count == numCourses; // 选了的课等于总课数，true，否则false
};

// 测试用例1: 可以完成所有课程
const numCourses1 = 2;
const prerequisites1 = [[1,0]];
console.log(canFinish(numCourses1, prerequisites1)); // true
// 课程0没有前置课程
// 课程1需要先修课程0
// 所以可以先修课程0，再修课程1

// 测试用例2: 存在循环依赖，无法完成所有课程
const numCourses2 = 2;
const prerequisites2 = [[1,0],[0,1]];
console.log(canFinish(numCourses2, prerequisites2)); // false
// 课程0和课程1互相依赖，无法完成

// 测试用例3: 多个课程的依赖关系
const numCourses3 = 4;
const prerequisites3 = [[1,0],[2,1],[3,2]];
console.log(canFinish(numCourses3, prerequisites3)); // true
// 课程依赖关系: 3->2->1->0
// 可以按照 0->1->2->3 的顺序学习

// 测试用例4: 没有依赖关系
const numCourses4 = 3;
const prerequisites4 = [];
console.log(canFinish(numCourses4, prerequisites4)); // true
// 所有课程都没有前置要求，可以任意顺序学习

// 测试用例5: 复杂的依赖关系
const numCourses5 = 5;
const prerequisites5 = [[1,0],[2,1],[3,1],[4,2],[4,3]];
console.log(canFinish(numCourses5, prerequisites5)); // true
// 可以按照 0->1->(2,3)->4 的顺序学习
