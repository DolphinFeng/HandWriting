// 遍历给定节点id的所有子节点，如有结果以数组形式输出
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


// 1
// ├── 2
// │   ├── 3
// │   │   └── 4
// │   ├── 5
// │   └── 6
// │       └── 7
// └── 8
//     └── 9


// 示例：fn(tree, '1', 'id') // [2，3，4，5，6，7，8，9]
// 示例：fn(tree, '2', 'id') // [3，4，5，6，7]
// 示例：fn(tree, '8', 'id') // [9]
// 示例：fn(tree, '7', 'id') // '当前节点下无子节点'


function fn (tree, target, isField) {
    let res = []
    // 找到目标节点
    function traverse (tree) {
        for (let node of tree) {
            if (node[isField] === target) {
                getId(node.children)
                return
            }
            if (node.children) {
                traverse(node.children)
            }
        }
    }

    function getId (nodes) {
        if (!nodes || nodes.length === 0) {
            res = '当前节点下无子节点'
            return
        }
        for (let node of nodes) {
            res.push(node[isField])
            if (node.children) {
                getId(node.children)
            }
        }
    }
    traverse(tree)
    return res
}

// console.log(fn(tree, '5', 'id'));
console.log(fn(tree, '7', 'id'));
console.log(fn(tree, '1', 'id'));
