// 江总百度校招二面
// 手写：写一个并发控制函数，和生成模拟请求列表函数

class SuperTask {
    constructor (max) {
        this.tasks = []
        this.capacity = max
        this.runNum = 0
    }

    run (task) {
        return new Promise((resolve, reject) => {
            this.tasks.push({task , resolve, reject})
            this.runTask()
        })
    }

    runTask () {
        if (this.runNum < this.capacity && this.tasks.length) {
            this.runNum++
            const { task , resolve, reject } = this.tasks.shift()
            task()
                .then(resolve, reject)
                .finally(() => {
                    this.runNum--
                    this.runTask()
                })
        }
    }
}
const p = new SuperTask(2)

const timer = (timeout) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve()
        }, timeout)
    })
}

const addPromise = (timeout, taskName) => {
    p.run(() => timer(timeout))
        .then(() => {
            console.log(`任务${taskName}完成`)
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
