# 快手游戏一面 8.23 （全程 45min）
## 文件切片怎么做的
    回答得不够具体
## 文件切片断网，弱网怎么处理
    有空看下断点续传怎么实现
## 浏览器 6 个并发数如何打破
    给定不同的子级域名
    追问：除了这个还有什么方法
## http 历史
    应该想让我说 keep-alive ，因为可以解决 上面 那个限制
## vue 的 nextTick
    回答得不行
    追问：nextTick 在什么时机执行
    回答错了，需要真正看一遍源码
## event-loop
    api 说得不够多啊
## 跨域解决方法
    回答得不够详细
## cookie, localStorage, session区别
    有点忘记了
## 聊聊token 
    回答得不够详细
    追问：提到了和前几个空间的区别，说了不受同源影响
## cookie 在多个子域名会跨域吗，他是存在哪一级域名下
    孟杰说哪一层都可以存
    如果 Cookie 的 Domain 属性设置为顶级域名，则在该顶级域名及其所有子域名之间访问 Cookie 不会被视为跨域。
    如果 Cookie 的 Domain 属性未设置或设置为某个子域名，则只能在该子域名下访问，其他子域名访问时会被视为跨域。
## vue3 的优点
    聊了响应式，但是不够详细
## es6 箭头函数和普通函数的区别
    this，构造函数
    追问：箭头函数的 this 可以更改吗
    回答说是可以，其实不可以，因为箭头函数的 this 是在定义时确定的，而非调用时
## 手写发布订阅
    不熟