// 二叉树转链表，美团秋招一面
function TreeNode(val, left, right) {
    this.val = (val === undefined ? 0 : val)
    this.left = (left === undefined ? null : left)
    this.right = (right === undefined ? null : right)
}

// 示例二叉树
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

/**
 * 将二叉树转化为链表
 * @param {TreeNode} tree - 二叉树的根节点
 */
function flatten (tree) {
    if (!tree) return
    flatten(tree.left)
    flatten(tree.right)

    let left = tree.left
    let right = tree.right
    tree.left = null
    tree.right = left

    while (tree.right) {
        tree = tree.right
    }

    tree.right = right
}

flatten(tree)
console.log(tree);
