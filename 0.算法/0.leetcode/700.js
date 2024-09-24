// 二叉搜索树中的搜索

var searchBST = function(root, val) {
    if (!root) return null
    if (root.val === val) return root 
    else if (root.val > val) return searchBST(root.left, val)
    else if (root.val < val) return searchBST(root.right, val)
    return null
};

const root = {
    val: 4,
    left: {
        val: 2,
        left: {
            val: 1,
            left: null,
            right: null
        },
        right: {
            val: 3,
            left: null,
            right: null
        }
    },
    right: {
        val: 7,
        left: null,
        right: null
    }
}

console.log(searchBST(root, 2)); // 2
