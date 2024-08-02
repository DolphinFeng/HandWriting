// 遍历给定节点id的所有子节点，如有结果以数组形式输出
// fn(tree, '1', 'id') => ['2', '3', '4','5', '6', '7', '8', '9']
// fn(tree, '8', 'id') => ['9']
// fn(tree, '5', 'id') => 当前节点下无子节点

const tree = [
    {
        id: "1",
        children: [
            {
                id: "2",
                children: [
                    {
                        id: "3",
                        children: [{ id: "4" }]
                    },
                    { id: "5" },
                    {
                        id: "6",
                        children: [{ id: "7" }]
                    },
                ]
            },
            {
                id: "8",
                children: [{ id: "9" }]
            }
        ]
    }
]


function fn (tree, targetId, isField) {
    let res = []
    
    function traverse (nodes) {
        for (let node of nodes) {
            if (node[isField] === targetId) {
                collectionChildren(node.children)
                return
            }
            if (node.children) {
                traverse(node.children)
            }
        }
    }

    function collectionChildren (children) {
        if (!children || children.length === 0) {
            res = '当前节点下无子节点'
            return
        }
        for (let child of children) {
            res.push(child[isField])
            if (child.children) {
                collectionChildren(child.children)
            }
        }
    }

    traverse(tree)
    return res
}

console.log(fn(tree, '1', 'id'));