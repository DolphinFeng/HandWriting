// 二叉树中的最大路径和

const maxPathSum = (root) => {
    let maxSum = Number.MIN_SAFE_INTEGER; // 最大路径和

    const dfs = (root) => {
        if (root == null) { // 遍历到null节点，收益0
            return 0;
        }
        const left = dfs(root.left);   // 左子树提供的最大路径和
        const right = dfs(root.right); // 右子树提供的最大路径和

        const innerMaxSum = left + root.val + right; // 当前子树内部的最大路径和
        maxSum = Math.max(maxSum, innerMaxSum);      // 挑战最大纪录

        const outputMaxSum = root.val + Math.max(0, left, right); // 当前子树对外提供的最大和

        // 如果对外提供的路径和为负，直接返回0。否则正常返回
        return outputMaxSum < 0 ? 0 : outputMaxSum;
    };

    dfs(root);  // 递归的入口

    return maxSum;
};

function TreeNode(val, left, right) {
    this.val = (val===undefined ? 0 : val)
    this.left = (left===undefined ? null : left)
    this.right = (right===undefined ? null : right)
}

// 测试用例1: 最大路径和为6
const root1 = new TreeNode(1);
root1.left = new TreeNode(2);
root1.right = new TreeNode(3);
console.log(maxPathSum(root1)); // 6
//     1
//    / \
//   2   3

// 测试用例2: 最大路径和为42
const root2 = new TreeNode(-10);
root2.left = new TreeNode(9);
root2.right = new TreeNode(20);
root2.right.left = new TreeNode(15);
root2.right.right = new TreeNode(7);
console.log(maxPathSum(root2)); // 42
//     -10
//     /  \
//    9   20
//       /  \
//      15   7

// 测试用例3: 最大路径和为2
const root3 = new TreeNode(2);
root3.left = new TreeNode(-1);
console.log(maxPathSum(root3)); // 2
//     2
//    / 
//  -1

// 测试用例4: 最大路径和为1
const root4 = new TreeNode(1);
console.log(maxPathSum(root4)); // 1
//     1

// 测试用例5: 空树
const root5 = null;
console.log(maxPathSum(root5)); // Number.MIN_SAFE_INTEGER
// 空树
