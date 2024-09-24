// 二叉树的锯齿形层次遍历

var zigzagLevelOrder = function(root) {
    const res = [];
    if (root == null) {
        return res;
    }
    let curLevel = [root]; // 存放当前层的节点

    while (curLevel.length) {
        const nextLevel = []; // 存放下一层的节点
        const curLevelVals = []; // 存放当前层的节点值

        for (const node of curLevel) { // 遍历
            curLevelVals.push(node.val);
            node.left && nextLevel.push(node.left);
            node.right && nextLevel.push(node.right);
        }

        res.push(curLevelVals); // 当前层遍历结束，加入res
        res.length % 2 == 0 && curLevelVals.reverse(); // 偶数层进行翻转
        curLevel = nextLevel; // 更新
    }

    return res;
};

const root = {
    val: 3,
    left: {
        val: 9,
        left: null,
        right: null
    },
    right: {
        val: 20,
        left: {
            val: 15,
            left: null,
            right: null
        },
        right: {
            val: 7,
            left: null,
            right: null
        }
    }
}

//     3
//    / \
//   9   20
//      /  \
//     15   7

console.log(zigzagLevelOrder(root)); 
