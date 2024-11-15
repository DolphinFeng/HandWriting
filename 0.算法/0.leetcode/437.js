// 路径总和 III

/**
 * @param {TreeNode} root
 * @param {number} targetSum
 * @return {number}
 */
var pathSum = function (root, targetSum) {
    let map = new Map()
    let ans = 0
    dfs(root, 0)
    return ans
    function dfs(root, presum) {
        if (!root) {
            return 0
        }
        map.set(presum, (map.get(presum) || 0) + 1)
        let target = presum + root.val
        ans += (map.get(target - targetSum) || 0)
        // 继续找
        dfs(root.left, target)
        dfs(root.right, target)
        // 回溯 撤销
        map.set(presum, map.get(presum) - 1)
    }
};


function TreeNode(val, left, right) {
    this.val = (val===undefined ? 0 : val)
    this.left = (left===undefined ? null : left)
    this.right = (right===undefined ? null : right)
}
// 测试用例1: 路径总和为8
const root1 = new TreeNode(10);
root1.left = new TreeNode(5);
root1.right = new TreeNode(-3);
root1.left.left = new TreeNode(3);
root1.left.right = new TreeNode(2);
root1.right.right = new TreeNode(11);
root1.left.left.left = new TreeNode(3);
root1.left.left.right = new TreeNode(-2);
root1.left.right.right = new TreeNode(1);
console.log(pathSum(root1, 8)); // 3
//       10
//      /  \
//     5   -3
//    / \    \
//   3   2   11
//  / \   \
// 3  -2   1

// 测试用例2: 路径总和为0
const root2 = new TreeNode(1);
root2.left = new TreeNode(-2);
root2.right = new TreeNode(-3);
root2.left.left = new TreeNode(1);
root2.left.right = new TreeNode(3);
root2.right.left = new TreeNode(-2);
root2.left.left.left = new TreeNode(-1);
console.log(pathSum(root2, 0)); // 4
//       1
//      / \
//    -2  -3
//    / \   /
//   1   3 -2
//  /
// -1

// 测试用例3: 空树
const root3 = null;
console.log(pathSum(root3, 8)); // 0

// 测试用例4: 只有一个节点的树
const root4 = new TreeNode(1);
console.log(pathSum(root4, 1)); // 1

// 测试用例5: 只有一个节点的树，目标和不匹配
console.log(pathSum(root4, 2)); // 0
