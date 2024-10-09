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

/**
 * 遍历树结构，找到目标节点的所有子节点
 * @param {Array} tree - 树结构数据
 * @param {string} targetId - 目标节点的ID
 * @param {string} idField - 节点ID字段的名称
 * @returns {Array|string} - 返回子节点ID数组或提示信息
 */
function fn (tree, target, isField) {
    let res = []

    function traverse (node) {
        for (let child of node) {
            if (child[isField] === target) {
                getId(child.children)
                return 
            } else {
                child.children && traverse(child.children)
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
            child.children && getId(child.children)
        }
    }
    
    traverse(tree)

    return res
}

console.log(fn(tree, '5', 'id'));