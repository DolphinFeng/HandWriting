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

function maxLevel(root) {
    let level = 0;

    function dfs(root, l) { 
        level = Math.max(level, l);

        for (let child of root.children) {
            dfs(child, l + 1);
        }
    }

    dfs(root, 1);

    return level;
}

console.log(maxLevel(tree));