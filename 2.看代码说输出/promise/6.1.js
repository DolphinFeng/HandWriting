// await是只会因为 返回的是promise时才会等待  不是promise时就是同步代码了

var a
var b = new Promise((resolve) => {
    console.log(1);
    setTimeout(() => {
       resolve(2)
    }, 1000)
   }).then(() => {
    console.log(3);
   }).then(() => {
    console.log(4);
   }).then(() => {
    console.log(5);
   })
a = new Promise(async (resolve) => {
    console.log(a)
    // await b
    await a // 因为a是undefined吧  毕竟await是只会因为 返回的是promise时才会等待  不是promise时就是同步代码了
    console.log(a, '1')
    resolve(true)
    console.log(6);
})