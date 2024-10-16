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


# 小鹏一面 9.25（全程 40min）
## 解释下面的 ts
```ts
// 解释这段 ts 代码含义
export interface ReactRoute extends Omit<Optional<ReactRouteBase, 'rawRoute' | 'path'>, 'children'> {
    children?: ReactRoute[]
}
```
## Nuxt.js 约定式路由框架，如何实现一个约定式路由（文件式路由）：指定目录下写文件，然后路由自动生成。基于这样的描述，你有什么思路实现这样的约定式路由，用 webpack 或者 vite 插件
    面试官：正常用 vue，react 都要去配置一个路由文件，这是一个很浪费时间的事情
    这样实现本质上就是读取到一个文件目录树，对应去匹配生成这样的配置文件
## token 相对于传统的 session + cookie 有什么优势
    可以跨域，更安全
    追问：这里的跨域是指什么？面试官：token 可以跨域是指 token 可以由前端选择性存储，跟跨域就没有了联系，cookie 跨域就是因为后端塞 cookie，会经过浏览器这一层，token 就相当于是完全交给了自己去处理
## sso 了解吗，美团肯定有 sso
    从用户体验上，可以借助 cookie + session 这个模式
    追问：sso 的 Auth2 规范了解吗
## 闭包，闭包的使用场景
    按钮弹窗
    追问：从 js 语言角度看，闭包为什么不会被销毁（GC），如何解决内存泄漏问题
## 美团国际化怎么实现的，了解怎么实现的
    以高阶组件的形式进行抛出
## 对前后端角色的理解
    前端本质上就是切图，后端本质上就是增删改

# 字节飞书一面 10.10 (全程 55min)
## 安卓系统为什么没有 intl 这个 api，他不是具有 chrome 的内核吗
## 从团队角度，接手一个需求，除了自测，如何保证功能的稳定性
    组长的 cr；需求评审；单元测试（验证单个组件或函数的正确性，用 jest 运行测试，确保测试通过）;集成测试；端到端测试；持续集成；回归测试；用户验收测试；性能测试；监控和日志
## 了解前端自动化测试
## 浏览器的并发数限制为 6 ，自己如何解决这个限制的
## 前端自动化检测了解吗
    lint 算吗，
    单元测试应该算，单元测试可以理解为最小范围化测试自己写的函数，组件等，满足预期功能即可
## useEffect 和 useLayoutEffect 区别
## http 1 和 2 的区别
## http 2 的最大特性
    多路复用、https
## 强缓存、协商缓存
    追问：为什么强缓存无法缓存 html 资源，get 请求都不行吗，那 js 这种资源也是 get 请求能强缓存吗
    我回答到有点像是跨域，script 的 src 请求不会跨域
    追问：给你一个网站，你如何设置强缓存、协商缓存策略，最终是人决定的
    强缓存场景：会有一直资源不变的情况吗，logo 未来也是会变的，这个时候怎么办
    那强缓存的意义在哪里
    是不是得判断下，怎么判断，后端判断文件的 checksum，
## css 盒子模型，怎么应用（从应用场景）
    我回答到：看你愿不愿意 content 被压缩，以保证最终的宽度
## react native 如何实现的跨端，使用上有没有遇到什么问题，为什么移动端要使用 rn 
## useEffect, useLayoutEffect 区别，你常用的哪些钩子，类组件和函数组件的区别
## react diff 算法了解吗
## v-model 怎么实现的
## 代码题：
```js
// 下面输出什么
var result = []
var a = 3
var total = 0
function foo (a) {
    var i = 0;
    for (; i < 3; i++) {
        result[i] = function () {
            total += i * a
            console.log(total);
        }
    }
}

foo(1)
result[0]() // 3
result[1]() // 6 
result[2]() // 9

// 实现代码
// 给定一个二叉树和一个数字n,判断二叉树中是否有一个路径之和为 n   字节飞书一面
// n 为 22，二叉树的定义如下:
let tree = {
    val: 5,
    left: {
        val: 4,
        left: {
            val: 11,
            left: {
                val: 7
            },
            right: {
                val: 2
            }
        }
    },
    right: {
        val: 8,
        left: {
            val: 13,
            right: {
                val: 1
            }
        },
        right: {
            val: 4
        }
    }
}

//         5
//        / \
//       4   8
//      /   / \
//     11  13  4
//    /  \   \  17
//   7    2   1
//  27    22  27

function solution(root, num) {
    function dfs(root, res = 0) {
        if (!root) return false
        res += root.val
        if (!root.left && !root.right && res === num) {
            return true
        }
        return dfs(root.left, res) || dfs(root.right, res)
    }
    return dfs(root)
}

console.log(solution(tree, 22)); // true
console.log(solution(tree, 26)); // false
console.log(solution(tree, 18)); // false
console.log(solution(tree, 27)); // true
console.log(solution(tree, 5));  // false
```

# 滴滴一面 10.12 （全程 45min）
## CommonJS EsModule 区别，不谈语法，谈原理
    追问：模块的加载时机是否一样，是否注意过 tree-shaking，tree-shaking为什么只能对 ESModule ，而不能对 CommonJs。和编译时的依赖收集有关
    CommonJs 可以转换为 ESM ，是 webpack 的哪个工具实现的，是 loader，不是 plugin，是哪个 loader 呢。是 babel 吧
    loader 和 plugin 的区别，常用的 loader 和 plugin 能讲出两个吗，比如 css-loader, style-loader, scss-loader, vue-loader
    追问：vue 最终转换的 源码，有个 render 函数，这个 render 函数是干嘛的呢, 然后编译时 script 部分是怎么跟 ts 关联起来的，babel-rules
    transform 是 vite 钩子之一，在 require 才会执行，这其实就是 ESM 在 vite 中的 应用
## js 闭包
## 浏览器的同源策略
## ref 中的 .value 是怎么来的
    其实是 对 对象转成了 对象 用 proxy 代理，所以变成了一个对象，取名为 value
## v-for 的 key，在前端渲染上他的优势在哪儿
## 写一个二叉树遍历
## 小程序 和 浏览器 的 h5 
    运行机制、开发语法、发布
## A, B 两个分支, A mr 到了 B，我现在想要撤回掉 commit
    追问：git revert，回滚分支的操作，如果是 merge request B 分支怎么处理，commit id 有两个，一个 add, 一个提交的 id，分支合并也会产生一个 id
    切到 B 分支，git log 拿到 commit id，然后 git revert <commit-id>，然后再 git commit -m 'Revert commit <commit-id>'
## koa 的洋葱模型，有没有用过具体的插件，比如鉴权，请求前的拦截器 intercepters
## 实现一个 class 的 intercepters
    让 拦截器可以执行传递的函数即可
```js
// const myRequest = new CustomRequest()

// myRequest.intercepters(async (config) => {
//     // 统一处理 fetch config
//     await xxx()
//     if ((config.url.includes('didi.com')) {
//         config.header.cityid = 1
//         return config
//     }, 100)
    
// })

class myRequest {
    intercepters (cb) {
        this.array.push(cb)
    }
    
    fetch (config) {
        this.intercepters.forEach(() => cb())
        fetch()
            .then(this.response)
    }
}
```
## 最长字符串无重复子串 leetcode No.3
## 反问
    组内业务；如何平衡业务，技术；建议