async function asy1() {
    console.log(1);
    await asy2()
    console.log(2);
}
// await 1.同一行的代码捋成同步，后续代码捋成微任务，若没有后续代码，整个async完成就是微任务
const asy2 = async () => {
    await (async () => {
        await (() => {
            console.log(3);
        })()
        console.log(4);
    })()
}

const asy3 = async() => {
    Promise.resolve().then(() => {
        console.log(6);
    })
}

asy1()
console.log(7);
asy3()
// 拿下
