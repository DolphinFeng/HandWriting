// 二叉树转链表
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
function flatten(tree) {
    // 如果树为空，直接返回
    if (!tree) return 
    // 递归处理左子树
    flatten(tree.left)
    // 递归处理右子树
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

// 调用函数将二叉树转化为链表
flatten(tree)
// 打印转换后的链表
console.log(tree);
