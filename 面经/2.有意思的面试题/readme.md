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

# http 属于哪一层
HTTP（HyperText Transfer Protocol，超文本传输协议）属于OSI模型的应用层（第七层）。在TCP/IP模型中，HTTP也属于应用层。

OSI模型
OSI（Open Systems Interconnection，开放系统互联）模型是一个分层的网络协议模型，共有七层：
1. 物理层（Physical Layer）
2. 数据链路层（Data Link Layer）
3. 网络层（Network Layer）
4. 传输层（Transport Layer）
5. 会话层（Session Layer）
6. 表示层（Presentation Layer）
7. 应用层（Application Layer）

TCP/IP模型
TCP/IP模型是实际应用中更为常用的网络协议模型，共有四层：
1. 网络接口层（Network Interface Layer）
2. 互联网层（Internet Layer）
3. 传输层（Transport Layer）
4. 应用层（Application Layer）

HTTP在模型中的位置
- 在OSI模型中，HTTP属于第七层，即应用层。
- 在TCP/IP模型中，HTTP也属于应用层。

HTTP协议用于在客户端和服务器之间传输超文本数据（如HTML文件），它是Web浏览器和Web服务器之间通信的基础协议。HTTP定义了客户端如何向服务器请求资源以及服务器如何响应这些请求。

# 反问
一个是面试部门的主要业务是做什么的，了解下业务，
二就是要个面试官的评价，方便自己查漏补缺

# package.json 有哪些内容
https://juejin.cn/post/7240805459288522808


