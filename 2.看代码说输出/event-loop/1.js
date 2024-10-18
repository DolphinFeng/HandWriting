async function asy1() {
    console.log(1);
    await asy2()
    console.log(2);
}

const asy2 = async () => {
    await setTimeout(() => {   // await 同行代码是同步，这里的做法是0s之后将定时器推入到宏任务
        Promise.resolve().then(() => {
            console.log(3);
        })
        console.log(4);
    }, 0)
}

const asy3 = async() => {
    Promise.resolve().then(() => {
        console.log(6);
    })
}

asy1()
console.log(7);
asy3()

// await 1.同一行的代码捋成同步，后续代码捋成微任务，若没有后续代码，整个async完成就是微任务
// 1 7 6 2 4 3

