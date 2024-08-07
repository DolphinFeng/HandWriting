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

function BFS (node) {
    if (!node) return
    let queue = [node]
    let res = []
    while (queue.length) {
        const currentNode = queue.shift()
        res.push(currentNode.val)
        if (currentNode.left) queue.push(currentNode.left)
        if (currentNode.right) queue.push(currentNode.right)
    }
    return res
}

// 调用BFS函数遍历二叉树并返回结果数组
const bfsResult = BFS(tree);
console.log(bfsResult); // 输出: [1, 2, 5, 3, 4, 6]