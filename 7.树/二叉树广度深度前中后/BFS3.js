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

//     1
//    / \
//   2   5
//  / \   \
// 3   4   6

// 右视图

function BFS(node) {
    if (!node) return [];
    const queue = [node];
    const result = [];
    while (queue.length) {
        const current = queue.shift();
        result.push(current.val);
        if (current.right) queue.push(current.right);
        if (current.left) queue.push(current.left);
    }
    return result;
}

const bfsResult = BFS(tree);
console.log(bfsResult); // 输出: [ 1, 5, 2, 6, 4, 3 ]
