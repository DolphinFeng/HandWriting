与其说是 有意思的面试题，不如说是 自己没有回答上来的面试题

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

# Vuex 和 redux 的区别
  一个 vue 一个 react，vuex 有个 mutation 特意强调同步修改状态，而 redux 用的 actions, reducers 模块来统一更改状态

# 富文本的实现怎么预防 xss 攻击
  其实市面上的 富文本库 已经预防好了，但是本质上预防的方法应该还是要做一个转义，比如 <> 这种符号需要转义为 html 字符串，有个库，DOMPurify 可以实现
  可以用内容安全策略csp，csp 是一个安全机制，可以帮助防止 xss 攻击，配置 csp:   
  <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' https://trusted.cdn.com;">
  确保 cookie 是 HTTP-only

# response 响应体有哪些字段
  答案：http 版本，状态码，状态文本
  响应头: content-type, content-length, set-cookie, expirse, last-modified, etag, server, location
  响应体: html文档，json 数据，图像等

# setState 是同步还是异步
  答案：既可以同步又可以异步，这取决于使用上下文。在生命周期和事件处理中，一般是异步，这样可以批量处理 setState，在 定时器或者 promise 中就是同步

# cookie 怎么拿到
document.cookie 
设置一个 cookie：setCookie('username', 'Alice', 7)
设置时间：data.setTime()  

# vuex 为什么比 pinia 多一个 mutation 模块
  答案：vuex 虽然有两个 模块，一个 mutation 一个 action，并且 mutation 只能同步修改 state，而 action 同步修改异步修改均可，其实 action 的修改最终会走入 mutation 中
  但是 pinia 作为新一代状态管理库，它简化了这个过程，使代码更加简洁
 
# Function.__proto__ 指向什么 
  答案：Function.__proto__ === Function.prototype
  因为 Function 其实也是由自己实例的

# vue3 为什么要设计 ref 和 reactive 两个响应式
  其实 ref 梭哈就行，vue 官网也是这么推荐的，ref 可以响应式常量，reactive 可以响应式复杂对象

# git pull 和 git fetch 的区别
  答案：git pull 可以理解为 git fetch 加上 git merge，也就是说 git fetch 只获取更新，不合并

# useEffect 和 useLayoutEffect 区别
  答案：useEffect 就像是 mount 挂载，也就是 浏览器完成回流重绘去执行，因此适用于不需要阻塞浏览器绘制的副作用，比如请求数据
  而 useLayoutEffect 是在 浏览器回流重绘之前执行，这也就是说 等 dom 变更后 同步执行，会阻塞浏览器的绘制

# useMemo 和 useCallback 区别
  答案：两个钩子都是用于性能优化的，都是来作缓存使用。
  useMemo 是用来缓存计算结果，这个使用场景就是计算过程开销大时，用 useMemo 缓存计算结果，避免每次渲染都重新计算，就很像 memoize
  useCallback 是用来缓存函数实例，当函数作为子组件的 props 传递时，useCallback 来缓存函数实例，避免子组件不必要的重新渲染