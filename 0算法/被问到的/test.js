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

// 示例：fn(tree, '1', 'id') // [2，3，4，5，6，7，8，9]
// 示例：fn(tree, '2', 'id') // [3，4，5，6，7]
// 示例：fn(tree, '8', 'id') // [9]
// 示例：fn(tree, '7', 'id') // '当前节点下无子节点'

// 拿到节点对应的树
function getTree (tree, target) {
    for (let node of tree) {
        if (node.id === target) {
            return node
        } else if (node.children) {
            const res = getTree(node.children, target)
            if (res) {
                return res
            }
        }
    } 
    return null
}

let newTree = getTree(tree, '2')
console.log(newTree);
// 拿到id
function getId (tree) {
    let id = []
    function traverse(node) {
        id.push(node.id)
        if (node.children) {
            node.children.forEach(item => {
                traverse(item)
            })
        }
    }
    traverse(tree)
    return id.slice(1)
}

let id = getId(newTree)
console.log(id);
