// 二叉搜索树中第K小的元素

var kthSmallest = function (root, k) {
    let node = root;
    let stack = [];
    while (node || stack.length) {
        while (node) {
            stack.push(node);
            node = node.left;
        }
        node = stack.pop();
        if (--k === 0) {
            return node.val;
        }
        node = node.right;
    }
    return null;
};

// test cases
function TreeNode(val, left, right) {
    this.val = (val===undefined ? 0 : val)
    this.left = (left===undefined ? null : left)
    this.right = (right===undefined ? null : right)
}

// 测试用例1: 第1小的元素
const root1 = new TreeNode(3);
root1.left = new TreeNode(1);
root1.right = new TreeNode(4);
root1.left.right = new TreeNode(2);
console.log(kthSmallest(root1, 1)); // 1
//     3
//    / \
//   1   4
//    \
//     2

// 测试用例2: 第2小的元素
console.log(kthSmallest(root1, 2)); // 2

// 测试用例3: 第3小的元素
console.log(kthSmallest(root1, 3)); // 3

// 测试用例4: 第4小的元素
console.log(kthSmallest(root1, 4)); // 4

// 测试用例5: 空树
const root2 = null;
console.log(kthSmallest(root2, 1)); // null

// 测试用例6: 只有一个节点的树
const root3 = new TreeNode(1);
console.log(kthSmallest(root3, 1)); // 1
