function preOrder(tree) { // 根左右
    if (!tree) return
    console.log(tree.value);
    preOrder(tree.left)
    preOrder(tree.right)
}

function minOrder(tree) { // 左根右
    if (!tree) return 
    minOrder(tree.left)
    console.log(tree.value);
    minOrder(tree.right)
}

function backOrder(tree) { // 左右根
    if (!tree) return 
    backOrder(tree.left)
    backOrder(tree.right)
    console.log(tree.value);
}