// 遍历给定节点id的所有子节点，如有结果以数组形式输出
const tree = [
    {
        id: "1",
        children: [
            {
                id: "2",
                children: [
                    {
                        id: "3",
                        children: [{ id: "4" }]
                    },
                    { id: "5" },
                    {
                        id: "6",
                        children: [{ id: "7" }]
                    },
                ]
            },
            {
                id: "8",
                children: [{ id: "9" }]
            }
        ]
    }
]

// 1
// ├── 2
// │   ├── 3
// │   │   └── 4
// │   ├── 5
// │   └── 6
// │       └── 7
// └── 8
//     └── 9



// 示例：fn(tree, '1', 'id') // [2，3，4，5，6，7，8，9]
// 示例：fn(tree, '2', 'id') // [3，4，5，6，7]
// 示例：fn(tree, '8', 'id') // [9]
// 示例：fn(tree, '7', 'id') // '当前节点下无子节点'

/**
 * 遍历树结构，找到目标节点的所有子节点
 * @param {Array} tree - 树结构数据
 * @param {string} targetId - 目标节点的ID
 * @param {string} idField - 节点ID字段的名称
 * @returns {Array|string} - 返回子节点ID数组或提示信息
 */
function fn(tree, targetId, idField) {
    let result = [];

    /**
     * 递归遍历树节点，找到目标节点
     * @param {Array} nodes - 当前遍历的节点数组
     */
    function traverse(nodes) {
        for (let node of nodes) {
            // 如果找到目标节点，收集其子节点
            if (node[idField] === targetId) {
                collectChildren(node.children);
                return;
            }
            // 如果当前节点有子节点，继续递归遍历
            if (node.children) {
                traverse(node.children);
            }
        }
    }

    /**
     * 递归收集子节点ID
     * @param {Array} children - 当前节点的子节点数组
     */
    function collectChildren(children) {
        // 如果没有子节点，设置结果为提示信息
        if (!children || children.length === 0) {
            result = '当前节点下无子节点';
            return;
        }
        // 遍历子节点，收集ID并继续递归
        for (let child of children) {
            result.push(child[idField]);
            if (child.children) {
                collectChildren(child.children);
            }
        }
    }

    // 开始遍历树结构
    traverse(tree);
    return result;
}

console.log(fn(tree, '5', 'id'));
