// 定义一个二叉树
let tree = {
    val: 1, 
    left: {
        val: 2,
        left: {
            val: 3
        },
        right: {
            val: 4
        }
    },
    right: {
        val: 5,
        right: {
            val: 6
        }
    }
}

/**
 * 广度优先搜索（BFS）遍历二叉树
 * @param {Object} node - 二叉树的根节点
 * @returns {Array} - 返回遍历结果的数组
 */
function BFS(node) {
    if (!node) return [];
    const queue = [node];
    const result = [];
    while (queue.length) {
        const current = queue.shift();
        result.push(current.val);
        if (current.left) queue.push(current.left);
        if (current.right) queue.push(current.right);
    }
    return result;
}

const bfsResult = BFS(tree);
console.log(bfsResult); // 输出: [1, 2, 5, 3, 4, 6]


