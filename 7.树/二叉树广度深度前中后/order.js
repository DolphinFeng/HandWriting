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
 * 先序遍历二叉树（根-左-右）
 * @param {Object} tree - 二叉树的根节点
 * @param {Array} result - 存储遍历结果的数组
 */
function preOrder(tree, result = []) { // 根左右
    if (!tree) return // 如果节点为空，直接返回
    result.push(tree.val); // 将当前节点的值存入数组
    preOrder(tree.left, result) // 递归遍历左子树
    preOrder(tree.right, result) // 递归遍历右子树
    return result; // 返回结果数组
}

/**
 * 中序遍历二叉树（左-根-右）
 * @param {Object} tree - 二叉树的根节点
 * @param {Array} result - 存储遍历结果的数组
 */
function inOrder(tree, result = []) { // 左根右
    if (!tree) return // 如果节点为空，直接返回
    inOrder(tree.left, result) // 递归遍历左子树
    result.push(tree.val); // 将当前节点的值存入数组
    inOrder(tree.right, result) // 递归遍历右子树
    return result; // 返回结果数组
}

/**
 * 后序遍历二叉树（左-右-根）
 * @param {Object} tree - 二叉树的根节点
 * @param {Array} result - 存储遍历结果的数组
 */
function postOrder(tree, result = []) { // 左右根
    if (!tree) return // 如果节点为空，直接返回
    postOrder(tree.left, result) // 递归遍历左子树
    postOrder(tree.right, result) // 递归遍历右子树
    result.push(tree.val); // 将当前节点的值存入数组
    return result; // 返回结果数组
}

// 示例调用
let preOrderResult = preOrder(tree);
let inOrderResult = inOrder(tree);
let postOrderResult = postOrder(tree);

console.log('先序遍历结果:', preOrderResult);
console.log('中序遍历结果:', inOrderResult);
console.log('后序遍历结果:', postOrderResult);