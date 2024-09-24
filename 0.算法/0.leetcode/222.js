// 完全二叉树的节点个数

var countNodes = function (root) {
    if (root == null) return 0
    return countNodes(root.left) + countNodes(root.right) + 1
};

const root = {
    val: 1,
    left: {
        val: 2,
        left: {
            val: 4,
            left: null,
            right: null
        },
        right: {
            val: 5,
            left: null,
            right: null
        }
    },
    right: {
        val: 3,
        left: {
            val: 6,
            left: null,
            right: null
        },
        right: null
    }
}

console.log(countNodes(root)); // 6
