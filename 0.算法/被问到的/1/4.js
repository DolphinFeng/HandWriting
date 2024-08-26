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

/**
 * 获取指定层级及以下的所有节点ID
 * @param {Array} tree - 树形结构的数组
 * @param {number} level - 指定的层级
 * @returns {Array} - 包含指定层级及以下所有节点ID的数组
 */
function getAllIdsByLevel(tree, level) {
    let id = [] // 存储结果ID的数组
    if (level === 1) {
        // 如果层级为1，直接获取当前层级的所有ID
        for (let i = 0; i < tree.length; i++) {
            id.push(tree[i].id)
        }
    } else {
        // 如果层级大于1，递归获取子节点的ID
        for (let i = 0; i < tree.length; i++) {
            id.push(tree[i].id) // 添加当前节点的ID
            id.push(...getAllIdsByLevel(tree[i].children, level - 1)) // 递归获取子节点的ID
        }
    }
    return id // 返回结果ID数组
}

console.log(getAllIdsByLevel(tree, 2)); // 输出指定层级及以下的所有节点ID
