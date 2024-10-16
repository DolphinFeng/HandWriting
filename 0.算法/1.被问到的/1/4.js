const tree = [{
    id: 1,
    name: '一级 1',
    children: [{
        id: 4,
        name: '二级 1-1',
        children: [{
            id: 9,
            name: '三级 1-1-1'
        }, {
            id: 10,
            name: '三级 1-1-2'
        }]
    }, {
        id: 5,
        name: '二级 1-2',
        children: [{
            id: 11,
            name: '三级 1-2-1'
        }]
    }]
}, {
    id: 2,
    name: '一级 2',
    children: [{
        id: 6,
        name: '二级 2-1',
        children: [{
            id: 13,
            name: '三级 2-1-1'
        }]
    }]
}]

// 实现一个方法，getAllIdsByLevel(tree, level)获取指定小于等于level层级的所有id
// 1 -> [1, 2]
// 2 -> [1, 4, 5, 2, 6]

function getAllIdsByLevel (tree, level) {
    let res = []
    if (level === 1) {
        tree.forEach(item => {
            res.push(item.id)
        })
    } else {
        tree.forEach(item => {
            res.push(item.id)
            item.children && res.push(...getAllIdsByLevel(item.children, level - 1))
        })
    }
    return res
}


console.log(getAllIdsByLevel(tree, 2)); // 输出指定层级及以下的所有节点ID
