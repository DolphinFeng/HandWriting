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
    if (node === null) return
    result.push(node.val);
    DFS(node.left, result);
    DFS(node.right, result);
    return result;
}


// 调用DFS函数，从根节点开始遍历，并返回结果数组
let result = DFS(tree);
console.log(result); // 输出: [1, 2, 3, 4, 5, 6]