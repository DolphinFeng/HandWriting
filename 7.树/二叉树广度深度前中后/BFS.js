/**
 * 广度优先搜索（BFS）遍历二叉树
 * @param {Object} node - 二叉树的根节点
 */
function BFS (node) {
    // 初始化队列
    let queue = []
    // 将根节点加入队列
    queue.push(node)
    // 当队列不为空时，继续遍历
    while (queue.length) {
        // 取出队列的第一个节点
        let top = queue[0]
        // 打印当前节点的值
        console.log(top.val);
        // 如果左子节点存在，加入队列
        if (top.left) {
            queue.push(top.left)
        }
        // 如果右子节点存在，加入队列
        if (top.right) {
            queue.push(top.right)
        }
        // 移除队列的第一个节点
        queue.shift()
    }
}

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

// 调用BFS函数遍历二叉树
BFS(tree)
