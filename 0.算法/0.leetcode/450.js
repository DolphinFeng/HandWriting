// 删除二叉搜索树中的节点

var deleteNode = function (root, key) {
    if (root === null) return null;
    if (root.val === key) {
        if (!root.left) {
            return root.right;
        } else if (!root.right) {
            return root.left;
        } else {
            //找到右子树中最小的值
            let minNode = root.right;
            while (minNode.left != null) {
                minNode = minNode.left;
            }
            root.val = minNode.val;
            root.right = deleteNode(root.right, minNode.val)
        }
    } else if (root.val < key) root.right = deleteNode(root.right, key)
    else root.left = deleteNode(root.left, key)
    return root
};

const root = {
    val: 5,
    left: {
        val: 3,
        left: {
            val: 2,
            left: null,
            right: null
        },
        right: {
            val: 4,
            left: null,
            right: null
        }
    },
    right: {
        val: 6,
        left: null,
        right: {
            val: 7,
            left: null,
            right: null
        }
    }
}

//     5
//    / \
//   3   6
//  / \   \
// 2   4   7

console.log(deleteNode(root, 3));
console.log(111);
