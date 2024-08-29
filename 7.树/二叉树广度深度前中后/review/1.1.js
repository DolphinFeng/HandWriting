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
};

//       1
//      / \
//     2   5
//    / \   \
//   3   4   6

function zBFS (tree) {
    const res = []
    const queue = [tree]
    let leftToRight = true
    while (queue.length) {
        let levelSize = queue.length
        const currentLevel = []
        for (let i = 0; i < levelSize; i++) {
            const node = queue.shift()
            if (leftToRight) {
                currentLevel.push(node.val)
            } else {
                currentLevel.unshift(node.val)
            }
            if (node.left) queue.push(node.left)
            if (node.right) queue.push(node.right) 
        }
        res.push(currentLevel)
        leftToRight = !leftToRight
    }
    return res
}

console.log(zBFS(tree));