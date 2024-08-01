function BFS (node) {
    let queue = []
    queue.push(node)
    while (queue.length) {
        let top = queue[0]
        console.log(top.val);
        if (top.left) {
            queue.push(top.left)
        }
        if (top.right) {
            queue.push(top.right)
        }
        queue.shift()
    }
}

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

BFS(tree)