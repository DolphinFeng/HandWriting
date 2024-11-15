// 验证二叉搜索树

var isValidBST = function (root) {
    if (root == null) { return true };
    let arr = []
    let isInit = false
    let temp = Number.MIN_VALUE; // js 中最接近 0 的正数
    while (root != null || arr.length != 0) {
        while (root != null) {
            arr.push(root);
            root = root.left;
        }
        root = arr.pop();
        if (root.val <= temp && isInit) { return false }
        isInit = true
        temp = root.val;
        root = root.right
    }
    return true
};

// test cases
function TreeNode(val, left, right) {
    this.val = (val===undefined ? 0 : val)
    this.left = (left===undefined ? null : left)
    this.right = (right===undefined ? null : right)
}

// 测试用例1: 有效的BST
const root1 = new TreeNode(2);
root1.left = new TreeNode(1);
root1.right = new TreeNode(3);
console.log(isValidBST(root1)); // true
//   2
//  / \
// 1   3

// 测试用例2: 无效的BST
const root2 = new TreeNode(5);
root2.left = new TreeNode(1);
root2.right = new TreeNode(4);
root2.right.left = new TreeNode(3);
root2.right.right = new TreeNode(6);
console.log(isValidBST(root2)); // false
//     5
//    / \
//   1   4  // 4 < 5, 但是它的右子树中有 6 > 5
//      / \
//     3   6  // 6 > 5, 违反了BST的性质
