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

function getMax (tree) {
    let level = 0
    
    function DFS (tree, l) {
        level = Math.max(level, l)
        for (let child of tree.children) {
            DFS(child, l + 1)
        }
    }

    DFS(tree, 1)

    return level
}

console.log(getMax(tree));