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

function preOrder (node, res = []) {
    if (!node) return
    res.push(node.val)
    if (node.left) preOrder(node.left, res)
    if (node.right) preOrder(node.right, res)
    return res
}

function inOrder (node, res = []) {
    if (!node) return
    if (node.left) inOrder(node.left, res)
    res.push(node.val)
    if (node.right) inOrder(node.right, res)
    return res  
}

function postOrder (node, res = []) {
    if (!node) return 
    if (node.left) postOrder(node.left, res)
    if (node.right) postOrder(node.right, res)
    res.push(node.val)
    return res
}

// 示例调用
let preOrderResult = preOrder(tree);
let inOrderResult = inOrder(tree);
let postOrderResult = postOrder(tree);

console.log('先序遍历结果:', preOrderResult); //  [ 1, 2, 3, 4, 5, 6 ]
console.log('中序遍历结果:', inOrderResult); // [3, 2, 4, 1, 5, 6]
console.log('后序遍历结果:', postOrderResult); //  [ 3, 4, 2, 6, 5, 1 ]