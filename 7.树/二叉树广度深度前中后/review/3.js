let tree = {
    val: 1, 
    left: {
        val: 2,
        left: {
            val: 3
        },
        right: {
            val: 4
        }
    },
    right: {
        val: 5,
        right: {
            val: 6
        }
    }
}

//       1
//      / \
//     2   5
//    / \   \
//   3   4   6

function preOrder (tree, res = []) {
    if (!tree) return
    res.push(tree.val)
    preOrder(tree.left, res)
    preOrder(tree.right, res)
    return res 
}

function inOrder (tree, res = []) {
    if (!tree) return
    inOrder(tree.left, res)
    res.push(tree.val, res) 
    inOrder(tree.right, res)
    return res
}

function postOrder (tree, res = []) {
    if (!tree) return
    postOrder(tree.left, res)
    postOrder(tree.right, res)
    res.push(tree.val)
    return res 
}

// 示例调用
let preOrderResult = preOrder(tree);
let inOrderResult = inOrder(tree);
let postOrderResult = postOrder(tree);

console.log('先序遍历结果:', preOrderResult);
console.log('中序遍历结果:', inOrderResult);
console.log('后序遍历结果:', postOrderResult);