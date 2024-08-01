// 二叉树转链表
function TreeNode(val, left, right) {
    this.val = (val === undefined ? 0 : val)
    this.left = (left === undefined ? null : left)
    this.right = (right === undefined ? null : right)
}

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
}

function flatten(tree) {
    if (!tree) return 
    flatten(tree.left)
    flatten(tree.right)

    // 保存左右子树
    let left = tree.left
    let right = tree.right
    // 将左子树拼接到右边去
    tree.left = null
    tree.right = left
    // 将原先的右子树拼接到当前右子树的右边
    while (tree.right) {
        tree = tree.right
    }
    tree.right = right
}

flatten(tree)
console.log(tree);