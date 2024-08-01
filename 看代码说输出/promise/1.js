let promise = new Promise((resolve, reject) => {
  console.log(1);
  resolve('promise1 resolve')
})
const promise2 = promise.then(res => {
  console.log(res);
  return new Promise((resolve) => resolve(3))
})
console.log('2', promise2);
// 输出结果
// 1
// 2 Promise { <pending> }
// promise1 resolve

// 打印promise2时，状态为pending