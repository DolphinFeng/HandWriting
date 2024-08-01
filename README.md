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
> 用于记录线上发布历史的分支。永远是可用，稳定，可直接发布的分支，**禁止在此分支开发**

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

# git 指令

## merge
场景：分支合入 master 时显示有冲突，一般两个分支对同一文件同一部分代码进行了修改导致的，切到 master pull 最新然后回到自己的分支去 `git merge master`，遂用可视化工具解决冲突，看保留哪一部分还是都保留还是自行修改

## cherry-pick
场景：分支 a 的 commit 我希望移到分支 b 来，在 a 分支通过 git log 拿到那个 hash 值，然后来到分支 b 执行 `git cherry-pick <commit-hash>`

## stash
场景：我应该在另一个分支开发需求，当前分支下先把代码 add 到暂存区然后 `git stash`，这样代码存入到一个临时区，然后来到目标分支 `git stash pop`，这样代码就从一个分支来到当前分支了

## reset
场景：已经把当前 commit 推入到远程，其实 commit 信息写错了，现在希望撤回。拿到那个 commit 的 hash 值 然后 `git reset <commit hash>`，这个效果就是将指定 commit 从远程撤回，然后重新 commit 即可