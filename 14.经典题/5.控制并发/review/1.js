// 江总百度校招二面
// 手写：写一个并发控制函数，和生成模拟请求列表函数

class SuperTask {
    constructor (max) {
        this.task = []
        this.max = max
        this.runNum = 0
    }

    run (task) {
        return new Promise((resolve, reject) => {
            this.task.push({task, resolve, reject})
            this.runTask()
        })
    }

    runTask () {
        if (this.runNum < this.max && this.task.length) {
            this.runNum++
            let { task, resolve, reject } = this.task.shift()
            task()
                .then(resolve, reject)
                .finally(() => {
                    this.runNum--
                    this.runTask()
                })
            }
    }
}

const timer = (delay) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve()
        }, delay)
    })
}

let p = new SuperTask(2)

const addPromise = (delay, taskName) => {
    p.run(() => timer(delay))
        .then(() => {
            console.log('任务' + taskName + '完成');
        })
}

addPromise(1000, 1)
addPromise(500, 2)
addPromise(1500, 3)
addPromise(2000, 4)
addPromise(800, 5)
addPromise(1200, 6)
addPromise(700, 7)
addPromise(300, 8)
addPromise(900, 9)
addPromise(400, 10)
