// 二叉树的右视图

function rightSideView(root) {
    if (!root) return [];
    
    const result = [];
    const queue = [root];
    
    while (queue.length) {
        const levelSize = queue.length;
        
        for (let i = 0; i < levelSize; i++) {
            const node = queue.shift();
            
            // 每一层的最后一个节点才放入结果数组
            if (i === levelSize - 1) {
                result.push(node.val);
            }
            
            // 先放左节点再放右节点
            if (node.left) queue.push(node.left);
            if (node.right) queue.push(node.right);
        }
    }
    
    return result;

}

/*
        1
       / \
      2   3
       \   \
        5   4

从右边看这棵树，可以看到的节点是 [1,3,4]
*/
let root = {
    val: 1,
    left: {
        val: 2,
        left: null,
        right: {
            val: 5,
            left: null,
            right: null
        }
    },
    right: {
        val: 3,
        left: null,
        right: {
            val: 4,
            left: null,
            right: null
        }
    }
}

console.log(rightSideView(root));