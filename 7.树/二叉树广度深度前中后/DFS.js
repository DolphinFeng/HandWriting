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
 * 深度优先搜索（DFS）遍历二叉树，并返回结果数组
 * @param {Object} node - 当前节点
 * @param {Array} result - 存储遍历结果的数组
 * @returns {Array} - 返回遍历结果的数组
 */
function DFS(node, result = []) {
    // 如果当前节点为空，直接返回
    if (node === null) return
    // 将当前节点的值添加到结果数组中
    result.push(node.val);
    // 递归遍历左子树
    DFS(node.left, result);
    // 递归遍历右子树
    DFS(node.right, result);
    // 返回结果数组
    return result;
}


// 调用DFS函数，从根节点开始遍历，并返回结果数组
let result = DFS(tree);
console.log(result); // 输出: [1, 2, 3, 4, 5, 6]