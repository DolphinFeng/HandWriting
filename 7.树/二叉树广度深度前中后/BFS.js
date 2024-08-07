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
    // 如果根节点为空，返回空数组
    if (!node) return [];

    // 初始化队列，将根节点加入队列
    const queue = [node];
    // 初始化结果数组
    const result = [];

    // 当队列不为空时，继续遍历
    while (queue.length) {
        // 取出队列的第一个节点
        const current = queue.shift();
        // 将当前节点的值加入结果数组
        result.push(current.val);

        // 如果左子节点存在，加入队列
        if (current.left) queue.push(current.left);
        // 如果右子节点存在，加入队列
        if (current.right) queue.push(current.right);
    }

    // 返回遍历结果数组
    return result;
}

// 调用BFS函数遍历二叉树并返回结果数组
const bfsResult = BFS(tree);
console.log(bfsResult); // 输出: [1, 2, 5, 3, 4, 6]


