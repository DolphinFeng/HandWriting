/**
 * 先序遍历二叉树（根-左-右）
 * @param {Object} tree - 二叉树的根节点
 */
function preOrder(tree) { // 根左右
    if (!tree) return // 如果节点为空，直接返回
    console.log(tree.value); // 打印当前节点的值
    preOrder(tree.left) // 递归遍历左子树
    preOrder(tree.right) // 递归遍历右子树
}

/**
 * 中序遍历二叉树（左-根-右）
 * @param {Object} tree - 二叉树的根节点
 */
function minOrder(tree) { // 左根右
    if (!tree) return // 如果节点为空，直接返回
    minOrder(tree.left) // 递归遍历左子树
    console.log(tree.value); // 打印当前节点的值
    minOrder(tree.right) // 递归遍历右子树
}

/**
 * 后序遍历二叉树（左-右-根）
 * @param {Object} tree - 二叉树的根节点
 */
function backOrder(tree) { // 左右根
    if (!tree) return // 如果节点为空，直接返回
    backOrder(tree.left) // 递归遍历左子树
    backOrder(tree.right) // 递归遍历右子树
    console.log(tree.value); // 打印当前节点的值
}
