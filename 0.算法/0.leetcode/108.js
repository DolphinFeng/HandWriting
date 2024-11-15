// 将有序数组转换为二叉搜索树

var sortedArrayToBST = function (nums) {
    const buildBST = (start, end) => {
        if (start > end) { // 构成不了区间，返回null
            return null;
        }

        const midIndex = (start + end) >>> 1; // 求中间索引，等价于 Math.floor((start + end) / 2)，但是性能更好
        const root = new TreeNode(nums[midIndex]); // 构建当前节点

        root.left = buildBST(start, midIndex - 1); // 构建左子树
        root.right = buildBST(midIndex + 1, end); // 构建右子树

        return root;
    };

    return buildBST(0, nums.length - 1); // 递归的入口
};

// test cases
function TreeNode(val, left, right) {
    this.val = (val===undefined ? 0 : val)
    this.left = (left===undefined ? null : left)
    this.right = (right===undefined ? null : right)
}

const nums1 = [-10,-3,0,5,9];
console.log(sortedArrayToBST(nums1));
// 输出: [0,-3,9,-10,null,5]
//       0
//      / \
//    -3   9
//    /   /
//  -10  5
// 解释: [0,-10,5,null,-3,null,9] 也将是一个有效的二叉搜索树

const nums2 = [1,3];
console.log(sortedArrayToBST(nums2));
// 输出: [3,1]
// 解释: [1,null,3] 也是一个有效的二叉搜索树
