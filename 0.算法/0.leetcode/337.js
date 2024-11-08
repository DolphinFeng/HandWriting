const rob = (root) => { // 打劫以root为根节点的子树的最大收益
    if (root == null) {
        return 0;
    }
    // 打劫包括根节点的收益，保底是root.val
    let robIncludeRoot = root.val; 
    if (root.left) {
        robIncludeRoot += rob(root.left.left) + rob(root.left.right);
    }
    if (root.right) {
        robIncludeRoot += rob(root.right.left) + rob(root.right.right);
    }
    // 打劫不包括根节点的收益
    const robExcludeRoot = rob(root.left) + rob(root.right); 
    // 二者取其大
    return Math.max(robIncludeRoot, robExcludeRoot); 
};

let root = {
    val: 3,
    left: {
        val: 2,
        left: null,
        right: {
            val: 3,
            left: null,
            right: null
        }
    },
    right: {
        val: 3,
        left: null,
        right: {
            val: 1,
            left: null,
            right: null
        }
    }
}

console.log(rob(root)); // 7
