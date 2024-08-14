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
 await b
 console.log(a)
 await a
 resolve(true)
 console.log(6);
})

console.log('end');