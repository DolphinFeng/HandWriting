// 根据前序遍历和中序遍历构建二叉树

/**
 * 根据前序遍历和中序遍历构建二叉树
 * @param {number[]} preorder - 前序遍历数组
 * @param {number[]} inorder - 中序遍历数组
 * @return {TreeNode} - 构建的二叉树的根节点
 */
function buildTree(preorder, inorder) {
    // 如果前序遍历或中序遍历数组为空，返回null
    if (!preorder.length || !inorder.length) {
        return null;
    }

    // 前序遍历的第一个元素是根节点的值
    const rootValue = preorder[0];
    // 创建根节点
    const root = new TreeNode(rootValue);

    // 在中序遍历中找到根节点的位置
    const rootIndex = inorder.indexOf(rootValue);

    // 递归构建左子树
    root.left = buildTree(preorder.slice(1, rootIndex + 1), inorder.slice(0, rootIndex));
    // 递归构建右子树
    root.right = buildTree(preorder.slice(rootIndex + 1), inorder.slice(rootIndex + 1));

    // 返回根节点
    return root;
}

/**
 * 二叉树节点构造函数
 * @param {number} val - 节点的值
 */
function TreeNode(val) {
    this.val = val;
    this.left = this.right = null;
}

// 示例前序遍历数组
const preorder = [3, 9, 20, 15, 7];
// 示例中序遍历数组
const inorder = [9, 3, 15, 20, 7];
// 构建二叉树
const tree = buildTree(preorder, inorder);
// 输出构建的二叉树
console.log(tree);
