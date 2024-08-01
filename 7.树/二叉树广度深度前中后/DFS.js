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

function DFS (node) {
    if (node === null) return
    console.log(node.val);
    DFS(node.left) 
    DFS(node.right)
}

DFS(tree)