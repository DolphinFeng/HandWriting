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

// 1
// ├── 4
// │   ├── 9
// │   └── 10
// ├── 5
// │   └── 11
// 2
// └── 6
//     └── 13

// 实现一个方法，getAllIdsByLevel(tree, level)获取指定小于等于level层级的所有id

function getAllIdsByLevel (node, level) {
    let res = []
    
    if (level === 1) {
        node.forEach(item => {
            res.push(item.id)
        })
    } else {
        node.forEach(item => {
            res.push(item.id)
            res.push(...getAllIdsByLevel(item.children, level - 1))
        })
    }
    
    return res
}


console.log(getAllIdsByLevel(tree, 1)); // [ 1, 2 ]
console.log(getAllIdsByLevel(tree, 2)); // [ 1, 4, 5, 2, 6 ]