与其说是 有意思的面试题，不如说是 自己没有回答上来的面试题

# js 相关

## getElementBy和querySelect的区别
  答案：
  getElementBy 是原生 js 的方法，返回的是一个元素，而 querySelector 是 jquery 的方法，返回的是一个元素集合

## document.querySelectorAll()获取到的所有元素，可能不是同一个层级的，可能是父子层级的，你如何判断它们是哪个层级的呢
  答案：可以写一个遍历，从元素开始向上遍历，直到找到根节点为止，以此确定遍历次数-深度
  
## 在一个多层嵌套的标签中，如何判断一个子标签在父标签内
  答案：可以先单独拿到 标签，若父标签包含子标签，就是 父标签 会有个属性名为 childNodes 的属性，里面包含子标签;

## java 和 js 的区别
  答案：
  1. 语言类型：
    - Java 是一种静态类型语言，需要在编译时声明变量类型
    - JavaScript 是动态类型语言，变量类型在运行时确定

  2. 运行环境：
    - Java 需要 JVM 虚拟机运行
    - JavaScript 主要在浏览器中运行，也可以通过 Node.js 在服务器运行

  3. 面向对象：
    - Java 是完全面向对象的语言，所有代码必须在类中
    - JavaScript 是基于原型的面向对象，更加灵活

  4. 编译过程：
    - Java 需要先编译成字节码(.class)，再由 JVM 解释执行
    - JavaScript 是解释型语言，边解释边执行

  5. 应用场景：
    - Java 主要用于后端开发、Android 开发等
    - JavaScript 主要用于前端开发，Node.js 后端开发

## null 和 undefined 的区别
  答案：undefined 代表未定义，一般是声明了变量但没有赋值，或者函数没有返回值时就会得到 undefined
  而 null 代表空值，一般是人为的将变量赋值为 null，表示这个变量不应该有值
  
  类型上：typeof undefined === 'undefined'，而 typeof null === 'object'
  相等性：null == undefined 为 true，但 null === undefined 为 false
  
  使用场景：
  - undefined 常见于变量声明但未赋值、访问对象不存在的属性、函数无返回值
  - null 常用于主动释放对象引用、表示对象原型链的终点、作为函数的参数表示该参数不是对象

## Symbol 的出现是为了解决什么问题
  答案：命名污染、ECMA兼容性


## parseFloat(undefined) 输出啥
  NaN, parseFloat 是 JavaScript 中的一个全局函数，用于将一个字符串解析成浮点数。它会解析字符串中的数字，直到遇到一个非数字字符为止。

## 字符串可以通过下标修改吗
  let str = 'hello' str[0] = 'H' 改不了，这是因为字符串这种常量存在栈中，就是写死的 

## Function.__proto__ 指向什么 
  答案：Function.__proto__ === Function.prototype
  因为 Function 其实也是由自己实例的

## cookie 怎么拿到
document.cookie 
设置一个 cookie：setCookie('username', 'Alice', 7)
设置时间：data.setTime()  

## 以下代码有错吗？如果有错，应该如何改正？
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

## 强缓存如何实现更新，比如 baidu logo 明明强缓存 cache-control: max-age=31536000，但是节假日还是可以更新，怎么做到的
  答案：
  1， 文件名版本化，每次更新资源时，更改文件名，比如从 logo_v1.png， 改为 logo_v2.png，改了文件名，浏览器就会认为这是一个新的资源；
  2. URL 添加版本号或者哈希值作为查询参数，比如 logo.png?v=2，每次更新时改变参数值

## Local storage，Session storage，Cookies 的区别
  答案：
  - Local storage： 永久存储，除非手动删除，否则数据不会过期，大小限制 5M 或更多，看浏览器；他的作用域是同源页面
  ```js
    // 设置数据
  localStorage.setItem('key', 'value');
  // 获取数据
  const value = localStorage.getItem('key');
  // 删除数据
  localStorage.removeItem('key');
  // 清空所有数据
  localStorage.clear();
  ```
  - Session storage： 会话存储，浏览器关闭后数据会丢失，大小限制 5M 或更多，看浏览器；他的作用域是同源单个 tab 页
  ```js
    // 设置数据
    sessionStorage.setItem('key', 'value');
    // 获取数据
    const value = sessionStorage.getItem('key');
    // 删除数据
    sessionStorage.removeItem('key');
    // 清空所有数据
    sessionStorage.clear();
  ```
  - Cookies： 存储在客户端，大小限制 4KB，每次请求都会发送，可以设置过期时间；他的作用域是设置 Domain 和 path 属性来控制，一般来说同源所有页面都有效
  ```js
  // 设置 Cookie
  document.cookie = "key=value; expires=Fri, 31 Dec 9999 23:59:59 GMT; path=/";
  // 获取所有 Cookie
  const cookies = document.cookie;
  // 删除 Cookie
  document.cookie = "key=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
  ```
一般使用场景：
- Local storage： 需要长期存储数据，且不需要频繁更新，但是不建议在这人存储敏感信息，因为都可以访问到
- Session storage： 需要存储会话数据，且数据量不大，比如购物车；若登录信息存入这：一般就是该项目运行在 公共计算机，比如图书馆，网吧；
- Cookies： 需要存储少量数据，且需要频繁更新，比如用户信息

# css 相关

## css 预处理器中 ，less 和 sass 的区别
  答案：less 是基于 js 的，而 sass 是基于 ruby 的，less 是动态的，而 sass 是静态的，less 是弱类型，而 sass 是强类型
  项目复杂 SASS 更胜一筹，项目简单 less 更胜一筹

## css 两个盒模型 的应用场景
  答案：
  - 标准盒模型： 宽度由 content, padding, border 决定，当希望内容的宽度不受内边距边框影响就用这个，如设计稿的像素级还原。
  - IE盒模型： 宽度由 指定的宽度 决定，当希望元素的总宽度不变，内容内边距边框在其中调整时用这个，如响应式布局和自适应设计。

# vue 相关

## vue2响应式原理  
  答案：vue2 使用 Object.defineProperty 来劫持对象的属性，通过 getter 和 setter 来监听属性的变化，从而实现响应式。

## vue3 为什么要设计 ref 和 reactive 两个响应式
  其实 ref 梭哈就行，vue 官网也是这么推荐的，ref 可以响应式常量，reactive 可以响应式复杂对象

## vuex 为什么比 pinia 多一个 mutation 模块
  答案：vuex 虽然有两个 模块，一个 mutation 一个 action，并且 mutation 只能同步修改 state，而 action 同步修改异步修改均可，其实 action 的修改最终会走入 mutation 中
  但是 pinia 作为新一代状态管理库，它简化了这个过程，使代码更加简洁

## Vuex 和 redux 的区别
  一个 vue 一个 react，vuex 有个 mutation 特意强调同步修改状态，而 redux 用的 actions, reducers 模块来统一更改状态

# react 相关

## useContext 的弊端是什么
  答案：useContext 的弊端是，如果组件树很深，那么每次更新都会导致整个组件树重新渲染，这可能会导致性能问题。

## react hooks 的使用限制
  答案：
  1. 只能在函数组件中使用
  2. 不能在条件语句中使用
  3. 不能在循环中使用
  4. 不能在嵌套函数中使用

## react的组件分哪几种类型
    函数组价、类组件、高阶组件、受控组件、非受控组件

## 用过哪些 react 19 新特性
  答案：useSuspense

## useEffect 和 useLayoutEffect 区别
  答案：useEffect 就像是 mount 挂载，也就是 浏览器完成回流重绘去执行，因此适用于不需要阻塞浏览器绘制的副作用，比如请求数据
  而 useLayoutEffect 是在 浏览器回流重绘之前执行，这也就是说 等 dom 变更后 同步执行，会阻塞浏览器的绘制

## useMemo 和 useCallback 区别
  答案：两个钩子都是用于性能优化的，都是来作缓存使用。
  useMemo 是用来缓存计算结果，这个使用场景就是计算过程开销大时，用 useMemo 缓存计算结果，避免每次渲染都重新计算，就很像 memoize
  useCallback 是用来缓存函数实例，当函数作为子组件的 props 传递时，useCallback 来缓存函数实例，避免子组件不必要的重新渲染

## setState 是同步还是异步
  答案：既可以同步又可以异步，这取决于使用上下文。在生命周期和事件处理中，一般是异步，这样可以批量处理 setState，在 定时器或者 promise 中就是同步

## suspense 和 lazy 的区别
  答案：suspense 实现代码分割，lazy 实现异步加载

# 工程化 相关

## node 的包管理器有 npm，pnpm，yarn，他们区别是什么
  答案：

## vite 为什么比别的构建工具快
  答案：esm 静态分析

## package.json 有哪些内容
https://juejin.cn/post/7240805459288522808

# 网络 & 操作系统 相关

## 进程，线程
  进程可以理解为一个应用程序，独立运行，资源消耗大
  线程是进程的子集，是 cpu 调度的最小单位，一个进程可以有多个线程，线程共享进程的资源
  进程之间的通信：
  1. 管道
  2. 消息队列
  3. 共享内存
  4. 信号量
  5. 套接字
  线程之间的通信：
  1. 管道
  2. 消息队列
  3. 共享内存
  4. 信号量
  5. 套接字

## response 响应体有哪些字段
  答案：http 版本，状态码，状态文本
  响应头: content-type, content-length, set-cookie, expirse, last-modified, etag, server, location
  响应体: html文档，json 数据，图像等

## 富文本的实现怎么预防 xss 攻击
  其实市面上的 富文本库 已经预防好了，但是本质上预防的方法应该还是要做一个转义，比如 <> 这种符号需要转义为 html 字符串，有个库，DOMPurify 可以实现
  可以用内容安全策略csp，csp 是一个安全机制，可以帮助防止 xss 攻击，配置 csp:   
  <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' https://trusted.cdn.com;">
  确保 cookie 是 HTTP-only

## http 属于哪一层
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















# 面试技巧

## 反问
一个是面试部门的主要业务是做什么的，了解下业务，
二就是要个面试官的评价，方便自己查漏补缺，问自己的不足

# git 

## git pull 和 git fetch 的区别
  答案：git pull 可以理解为 git fetch 加上 git merge，也就是说 git fetch 只获取更新，不合并







 



















  



