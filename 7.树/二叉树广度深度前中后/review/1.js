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

//       1
//      / \
//     2   5
//    / \   \
//   3   4   6

function BFS (node) {
    let res = []
    let queue = [node]
    while (queue.length) {
        let cur = queue.shift()
        res.push(cur.val)
        if (cur.left) queue.push(cur.left)
        if (cur.right) queue.push(cur.right)  
    }
    return res
}

const bfsResult = BFS(tree);
console.log(bfsResult); // 输出: [1, 2, 5, 3, 4, 6]