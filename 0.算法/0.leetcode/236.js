// 二叉树的最近公共祖先

var lowestCommonAncestor = function (root, p, q) {
    if (root == null) { // 遇到null，返回null 没有LCA
        return null;
    }
    if (root == q || root == p) { // 遇到p或q，直接返回当前节点
        return root;
    }
    // 非null 非q 非p，则递归左右子树
    const left = lowestCommonAncestor(root.left, p, q);
    const right = lowestCommonAncestor(root.right, p, q);
    // 根据递归的结果，决定谁是LCA
    if (left && right) {
        return root;
    }
    if (left == null) {
        return right;
    }
    return left;
};

const root = {
    val: 3,
    left: {
        val: 5,
        left: {
            val: 6,
            left: null,
            right: null
        },
        right: {
            val: 2,
            left: {
                val: 7,
                left: null,
                right: null
            },
            right: {
                val: 4,
                left: null,
                right: null
            }
        }
    },
    right: {
        val: 1,
        left: {
            val: 0,
            left: null,
            right: null
        },
        right: {
            val: 8,
            left: null,
            right: null
        }
    }
}

//     3
//    / \
//   5   1
//  / \ / \
// 6  2 0  8
//   / \
//  7   4

// console.log(lowestCommonAncestor(root, root.left, root.right));
console.log(lowestCommonAncestor(root, root.left, root.left.right.right)); // 5

