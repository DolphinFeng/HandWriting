const tree = {
    val: 1,
    children: [
        {
            val: 2,
            children: [
                {
                    val: 3,
                    children: [
                        {
                            val: 4,
                            children: []
                        }
                    ]
                }
            ]
        },
        {
            val: 5,
            children: [
                {
                    val: 6,
                    children: []
                },
                {
                    val: 7,
                    children: []
                }
            ]
        }
    ]
}

/**
 * 计算树的最大深度
 * @param {Object} root - 树的根节点
 * @returns {number} - 树的最大深度
 */
function maxLevel(root) {
    let level = 0; // 初始化最大深度为0

    /**
     * 深度优先搜索（DFS）遍历树
     * @param {Object} root - 当前节点
     * @param {number} l - 当前节点的深度
     */
    function dfs(root, l) { 
        level = Math.max(level, l); // 更新最大深度

        // 遍历当前节点的所有子节点
        for (let child of root.children) {
            dfs(child, l + 1); // 递归调用，深度加1
        }
    }

    dfs(root, 1); // 从根节点开始，初始深度为1

    return level; // 返回树的最大深度
}

console.log(maxLevel(tree)); // 输出树的最大深度
