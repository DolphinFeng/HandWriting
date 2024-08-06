let tree = {
    val: 1, 
    left: {
        val: 2,
        left: {
            val: 3,
            left: null,
            right: null
        },
        right: {
            val: 4,
            left: null,
            right: null
        }
    },
    right: {
        val: 5,
        left: null,
        right: {
            val: 6,
            left: null,
            right: null
        }
    }
}

/**
 * 深度优先搜索（DFS）遍历二叉树
 * @param {Object} node - 当前节点
 */
function DFS (node) {
    // 如果当前节点为空，直接返回
    if (node === null) return
    // 打印当前节点的值
    console.log(node.val);
    // 递归遍历左子树
    DFS(node.left) 
    // 递归遍历右子树
    DFS(node.right)
}

// 调用DFS函数，从根节点开始遍历
DFS(tree)
