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
    
    function traverse (node) {
        for (let child of node) {
            if (child[isField] === target) {
                getId(child.children)
                return 
            }
            if (child.children) {
                traverse(child.children)
            }
        }
    } 

    function getId (children) {
        if (!children || children.length === 0) {
            res = '当前节点下无子节点'
            return
        }
        for (let child of children) {
            res.push(child[isField])
            if (child.children) {
                getId(child.children)
            }
        }
    }

    traverse(tree)
    return res
}

// console.log(fn(tree, '5', 'id'));
console.log(fn(tree, '7', 'id'));
console.log(fn(tree, '1', 'id'));
