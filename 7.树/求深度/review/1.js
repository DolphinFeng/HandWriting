const tree = {
    val: 1,
    children: [
        {
            val: 2,
            children: [
                {
                    val: 3,
                    children: [
                        {
                            val: 4,
                            children: []
                        }
                    ]
                }
            ]
        },
        {
            val: 5,
            children: [
                {
                    val: 6,
                    children: []
                },
                {
                    val: 7,
                    children: []
                }
            ]
        }
    ]
}

//         1
//        / \
//       2   5
//      /   / \
//     3   6   7
//    /
//   4

function getMax (node) {
    let level = 0

    function DFS (node, l) {
        level = Math.max(level, l)
        for (let child of node.children) {
            DFS(child, l + 1)
        }
    }

    DFS(node, 1)
    return level
}

console.log(getMax(tree));