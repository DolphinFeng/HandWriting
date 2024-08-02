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
                    children: [
                        {
                            val: 8,
                            children: [
                                {
                                    val: 9,
                                    children: []
                                }
                            ]
                        }
                    ]
                },
                {
                    val: 7,
                    children: []
                }
            ]
        }
    ]
}

// 求树的最大深度

function maxLevel (tree) {
    let level = 0;
    function dfs (node, l) {
        level = Math.max(level, l)
        for (let child of node.children) {
            dfs (child, l + 1)
        }
    }
    dfs (tree, 1)
    return level 
}


console.log(maxLevel(tree));