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



// 掘金：https://juejin.cn/post/6844904077537574919?searchId=20230927095310F49DA960ABBD93AB11AB#heading-1