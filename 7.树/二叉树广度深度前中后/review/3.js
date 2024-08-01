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

function preOrder (tree) {
    if (!tree) return 
    console.log(tree.val);
    preOrder(tree.left)
    preOrder(tree.right)
}

function minOrder (tree) {
    if (!tree) return
    minOrder(tree.left)
    console.log(tree.val);
    minOrder(tree.right) 
}

function backOrder (tree) {
    if (!tree) return
    backOrder(tree.left)
    backOrder(tree.right)
    console.log(tree.val); 
}

// preOrder(tree) // 123456

// minOrder(tree) // 324156

// backOrder(tree) // 342651