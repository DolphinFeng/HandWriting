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

//       1
//      / \
//     2   5
//    / \   \
//   3   4   6

function DFS (node, res = []) {
    if (!node) return
    res.push(node.val)
    if (node.left) DFS(node.left, res)
    if (node.right) DFS(node.right, res)  
    return res
}


// 调用DFS函数，从根节点开始遍历，并返回结果数组
let result = DFS(tree);
console.log(result); // 输出: [1, 2, 3, 4, 5, 6]