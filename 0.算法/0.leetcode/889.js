// 889. 根据前序和后序遍历构造二叉树

function TreeNode(val, left, right) {
    this.val = (val === undefined ? 0 : val)
    this.left = (left === undefined ? null : left)
    this.right = (right === undefined ? null : right)
}

var constructFromPrePost = function (pre, post) {
    if (pre.length == 0) {
        return null;
    };

    let tmp = pre[0];
    let index = post.indexOf(pre[1]);
    let root = new TreeNode(tmp);
    root.left = constructFromPrePost(pre.slice(1, index + 2), post.slice(0, index + 1));
    root.right = constructFromPrePost(pre.slice(index + 2), post.slice(index + 1, post.length - 1));

    return root
};

/*
根据前序遍历[1,2,4,5,3,6,7]和后序遍历[4,5,2,6,7,3,1]可以构造出如下二叉树:

       1
     /   \
    2     3
   / \   / \
  4   5 6   7

*/
let pre = [1, 2, 4, 5, 3, 6, 7], post = [4, 5, 2, 6, 7, 3, 1];
console.log(constructFromPrePost(pre, post));
