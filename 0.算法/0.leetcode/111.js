// 111. 二叉树的最小深度

const minDepth = (root) => {
    if (root == null) {            // 递归到null节点，返回高度0
        return 0;
    }
    if (root.left && root.right) { // 左右子树都存在，当前节点的高度1+左右子树递归结果的较小值
        return 1 + Math.min(minDepth(root.left), minDepth(root.right));
    } else if (root.left) {        // 左子树存在，右子树不存在
        return 1 + minDepth(root.left);
    } else if (root.right) {       // 右子树存在，左子树不存在
        return 1 + minDepth(root.right);
    } else {                       // 左右子树都不存在，光是当前节点的高度1
        return 1;
    }
};

let root = {
    val: 3,
    left: {
        val: 9,
        left: null,
        right: null
    },
    right: {
        val: 20,
        left: {
            val: 15,
            left: null,
            right: null
        },
        right: {
            val: 7,
            left: null,
            right: null
        }
    }
}

//     3
//    / \
//   9  20
//      / \
//     15  7

console.log(minDepth(root)); // 输出 2