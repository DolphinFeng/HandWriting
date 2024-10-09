// 解释这段 ts 代码含义

export interface ReactRoute extends Omit<Optional<ReactRouteBase, 'rawRoute' | 'path'>, 'children'> {
    children?: ReactRoute[]
}

// ReactRouteBase 是一个已经定义好的接口
// Optional 将 ReactRouteBase 接口中的 rawRoute 和 path 属性设置为可选 属性

// Omit 从 左边那块类型中移除 children 属性，接口添加了可选的 children 属性，表示可以包含多个子路由