Hi，这里是 Dolphin 的手写仓库

# 一、分支规范
    1. 分支命名字符仅使用 英文字母、数字、短横线‘-’、正斜线‘/’，且总字符长度不超过 100 个字符
> 分支名不能有下划线‘_’
> 
> 分支名不能包含空格或中文

    2. 多人开发建议使用如下分支
        a. 建议 feature/{需求task ID}/{需求描述} 作为该需求集成分支
        b. 使用feature/{需求taskID}/{需求描述}-{Task描述}作为开发分支
        c. 使用feature/{需求task ID}/{需求描述}提测上线
> master 分支仅作上线使用，不可在此分支开发，其他分支不可上线

## 分支类型

### master 主干分支
> 用于记录线上发布历史的分支。永远是可用，稳定，可直接发布的分支，有问题方便随时回滚，**禁止在此分支开发**

### feature 新需求开发分支
> 用于开发新功能或线下缺陷修复的分支。当开发一个新功能时或线下缺陷修复时，从 master 分支迁出 feature 分支，上线完后删除此分支

### bugfix 缺陷修复分支
> 当线上发现一个 bug 需要修复时，从 master 或 release 分支迁出 bugfix 分支，修复完毕合入 master 或 release 分支并删除此分支

### hotfix 热补分支
> 上线一个新功能出现一个 bug，需要紧急回滚修复，从 master 或 release 分支迁出 bugfix 分支，修复完合入 master 或 release 分支并删除此分支

### release 发布分支
> 一般用于同一时期多需求或大版本发布，测试无误后合入 master 发布


# 二、commit 规范
>  好的 commit 信息便于 cr，方便日后工作交接

每条 commit MESSAGE 应包含 header，body 和 footer，其中 header 部分是必须的

例如下面
```
fix: minor typos in code

see the issue for details on the typos fixed

fixes issue #12
```

通常就是简单的 header：`feat: 新增切换语言功能`

## 类型 Type
- feat: 新 feature
- fix: bug fix
- docs: 仅修改了文档
- style: 重新格式了代码，但没有修改任何代码，eg. 增加 eslint或者 IDE 的格式。
- refactor: 重构屎山
- perf: 性能优化
- test: 改动测试部分
- chore: 修改非核心逻辑，eg. 修改文档生成工具
- ci: 修改 ci 部分
  
  ～

# mac 安装 mvm
  - 卸载原先 node
    > 若 node -v 发现没有版本，则不需进行如下步骤

```
    sudo npm uninstall npm -g
    sudo rm -rf /usr/local/lib/node /usr/local/lib/node_modules /var/db/receipts/org.nodejs.*
    sudo rm -rf /usr/local/include/node /Users/$USER/.npm
    sudo rm /usr/local/bin/node
    sudo rm /usr/local/share/man/man1/node.1
    sudo rm /usr/local/lib/dtrace/node.d
```
  - 安装 nvm
    [源码](https://github.com/nvm-sh/nvm)
    直接下载上面的源码 nvm-master.zip
    随后进入终端打开该文件夹， 运行 `sh install.sh` 安装成功
  - 检验是否安装成功
    nvm -v
  - 安装指定 node 版本
    nvm i 16 
    > 这里以 16 为例

```
    nvm use 16
    nvm list
```
    > 查看所有的 node 版本

# mnpm 安装
  终端输入：

```
  alias mnpm="npm --registry=http://r.npm.sankuai.com \
  --cache=$HOME/.cache/mnpm \
  --disturl=http://npm.sankuai.com/mirrors/node \
  --userconfig=$HOME/.mnpmrc" 
```

# git 指令

## merge
场景：分支合入 master 时显示有冲突，一般两个分支对同一文件同一部分代码进行了修改导致的，切到 master pull 最新然后回到自己的分支去 `git merge master`，遂用可视化工具解决冲突，看保留哪一部分还是都保留还是自行修改

## cherry-pick
场景：分支 a 的 commit 我希望移到分支 b 来，在 a 分支通过 git log 拿到那个 hash 值，然后来到分支 b 执行 `git cherry-pick <commit-hash>`

## stash
场景：我应该在另一个分支开发需求，当前分支下先把代码 add 到暂存区然后 `git stash`，这样代码存入到一个临时区，然后来到目标分支 `git stash pop`，这样代码就从一个分支来到当前分支了

## reset
场景：已经把当前 commit 推入到远程，其实 commit 信息写错了，现在希望撤回。拿到那个 commit 的 hash 值 然后 `git reset <commit hash>`，这个效果就是将指定 commit 从远程撤回，然后重新 commit 即可

## rebase
场景：git rebase master 将当前分支的更改应用到另一个分支上面

## git branch -m new-branch-name
场景：当前分支因为命名问题无法推送到远程，需要重新命名。当当前分支上使用此指令，再 push 即可

# vscode 插件
- Chinese (Simplified) (简体中文) Language Pack for Visual Studio Code
- Live Server
- Import Cost
- Paste Image
- Markdown All in One
- Markdown Preview Enhanced
- ES7 React/Redux/GraphQL/React-Native snippets
- Reactjs code snippets
- Vetur
- Vue - Official
- ESLint
- Git Graph
- GitLens — Git supercharged
- React Native Tools
- PostCSS Language Support
- Tabnine: AI Chat & Autocomplete for JavaScript, Python, Typescript, Java, PHP, Go, an
  
  ～
# 浏览器插件
- JSONVue
- Grow in 掘金
- ModHeader
- Charset
- Vue.js devtools
- 沉浸式翻译
- Octotree - GitHub code tree

# 辅助网站
- markdown 语法大全：https://markdown.com.cn/basic-syntax/
- json 格式转换： json.cn
- git 指令：https://www.atlassian.com/zh/git/tutorials/merging-vs-rebasing
- git 官方详解：https://git-scm.com/book/zh/v2
- git 练习：https://learngitbranching.js.org/?locale=zh_CN
- react 事件顺序：https://www.cnblogs.com/echolun/p/15518631.html
- js 异步问题：https://github.com/getify/You-Dont-Know-JS/blob/1ed-zh-CN/async%20%26%20performance/ch2.md#%E4%BF%A1%E4%BB%BB%E9%97%AE%E9%A2%98
- 工程化：https://mp.weixin.qq.com/s/NuH-sga13okeMVGDFZWFtQ
- vue3编译原理解密：https://vue-compiler.iamouyang.cn/guide/vue-to-js.html
- Watch with @vue/reactivity: https://antfu.me/posts/watch-with-reactivity
- vue演示：https://play.vuejs.org/ 
- 三把斧演示：https://codepen.io/quentinhsu/pen/rNEpJdN
- es5：https://es5.github.io/#x11.9.3
- es6新特性: https://es6.ruanyifeng.com/
- ESLint：https://eslint.org/docs/latest/extend/custom-rule-tutorial
- boxShadow：https://dgerrells.com/blog/how-not-to-use-box-shadows
- 别人的手写：https://github.com/Sunny-117/js-challenges
- 别人的面试题：https://sunny-117.github.io/blog/
- 小林 coding(计网+操作系统最好)：https://xiaolincoding.com/
- web前端面试：https://vue3js.cn/interview/vue/vue.html#%E4%B8%80%E3%80%81%E4%BB%8E%E5%8E%86%E5%8F%B2%E8%AF%B4%E8%B5%B7
- web体系：https://senior-frontend.pages.dev/
- 公众号文章格式转化：https://editor.mdnice.com/
- github如何提 issue：https://docs.github.com/zh/issues/tracking-your-work-with-issues/quickstart
- react Fiber: https://fe.azhubaby.com/React/Fiber.html
- mdn上v8垃圾回收机制：https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Memory_management
- ts 文档： https://www.tslang.cn/docs/handbook/typescript-in-5-minutes.html
- ts体验：https://www.typescriptlang.org/play

  ## 算法
1. 入门指南：
   灵茶山艾府 - 分享｜如何科学刷题？
   https://leetcode.cn/circle/discuss/RvFUtj/
2. 周赛讲解：
   灵茶山艾府的 leetcode 周赛讲解
   https://space.bilibili.com/206214?spm_id_from=333.337.0.0
3. 模版库：
   灵茶山艾府的算法竞赛模板库(go 版本)
   https://github.com/EndlessCheng/codeforces-go
   我的算法学习笔记、模版库(python、go、ts 都有一些)
   https://github.com/981377660LMT/algorithm-study
4. 百科全书：
   算法教程网站
   https://oi-wiki.org/


# 辅助应用
- clashx 🪜
- fork git 可视化工具
- oh my zsh
- Xcode ios 模拟器
- Charles 抓包工具
  
  ～