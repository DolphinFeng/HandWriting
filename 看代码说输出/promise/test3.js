// .then 或 .catch 返回的值不能是 promise 本身，否则会造成死循环

// const promise = Promise.resolve().then(() => {
//     return promise;
//   })
//   promise.catch(console.err)

// async function recursiveFunction() {
//   await recursiveFunction(); // 无限递归调用
// }

// recursiveFunction().catch(err => {
//   console.error(err); // 输出栈溢出错误
// });

async function recursiveFunction() {
  await recursiveFunction(); // 无限递归调用
}

recursiveFunction();
// console.log('Program ended');
