type Task = (...params: any) => void | Promise<void>
class LazyMan {
    /**任务队列 */
    private queue: Task[] = []

    constructor(name: string) {
        this.add(() => console.log('我是 ' + name))
        setTimeout(() => { //利用宏任务的特性，确保同步任务执行完之后才来到这 （这里的同步任务指的是  lazyMan.drink('xxx').sleep(3000).eat('xx') 这样的事件注册）
            this.next()
        });
    }
    eat(food: string) {
        this.add(() => console.log('吃吃吃 ' + food))
        return this
    }
    sleep(time: number) {
        this.add(async () => {
            await new Promise<void>(r => setTimeout(() => {
                r()
                console.log(`睡了${time}ms，起床`);
            }, time))
        })
        return this
    }
    drink(thing: string) {
        this.add(() => console.log('喝喝喝 ' + thing))
        return this
    }
    sleepFirst(time: number) {
        this.addFirst(async () => {
            await new Promise<void>(r => setTimeout(() => {
                r()
                console.log(`睡了${time}ms，起床`);
            }, time))
        })
        return this
    }
    /**添加任务到末尾 */
    private add(task: Task) {
        this.queue.push(async () => {
            await task() //等待当前任务执行完后，接着执行下一个任务
            this.next()
        })
    }
    /**添加任务到开头 */
    private addFirst(task: Task) {
        this.queue.unshift(async () => {
            await task() //等待当前任务执行完后，接着执行下一个任务
            this.next()
        })
    }
    /**执行下一个任务 */
    private next() {
        this.queue.shift()?.()
    }
}
