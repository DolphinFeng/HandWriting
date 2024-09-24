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

function zBFS (node) {
    let res = []
    let queue = [node]
    let leftToRight = true
   
    while (queue.length) {
        let levelSize = queue.length
        let cur = []
        for (let i = 0; i < levelSize; i++) {
            let node = queue.shift()
            if (leftToRight) {
                cur.push(node.val)
            } else {
                cur.unshift(node.val)
            }

            if (node.left) queue.push(node.left)
            if (node.right) queue.push(node.right) 
        }

        res.push(cur)
        leftToRight = !leftToRight
    }

    return res
}

console.log(zBFS(tree));