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

function DFS (node, res = []) {
    if (node === null) return res
    res.push(node.val)
    DFS(node.left, res)
    DFS(node.right, res)
    return res
}


// 调用DFS函数，从根节点开始遍历，并返回结果数组
let result = DFS(tree);
console.log(result); // 输出: [1, 2, 3, 4, 5, 6]