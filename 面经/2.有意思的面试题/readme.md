# 以下代码有错吗？如果有错，应该如何改正？
源自：https://juejin.cn/post/7316539952475619362
```js
try {
  setTimeout(() => {
    throw new Error('err')
  }, 200);
} catch (err) {
  console.log(err);
}

try {
  Promise.resolve().then(() => {
    throw new Error('err')
  })
} catch (err) {
  console.log(err);
}
```
**try...catch不能异步捕获代码错误，因为它本身就是一个同步代码块**

正确改法: 定时器里面包裹 try catch， Promise 本身就有捕获错误的机制，因此不要用 try catch，用 catch 捕获即可
```js
setTimeout(() => {
  try {
    throw new Error('err')
  } catch (err) {
    console.log(err);
  }
}, 200);

Promise.resolve().then(() => {
  throw new Error('err')
}).catch(err => {
  console.log(err);
});
```