// 二叉树的广度遍历得到的数组：[3,-1,-1,1,null,null,7,-1,-1,null,-1,3,null,null,8,null,4]
// 设计一个函数，接收这个数组，返回树的结构

function TreeNode (val) {
    this.val = val;
    this.left = null;
    this.right = null;
}

function buildTree(arr) {
    if (arr.length === 0) return null;
    
    let root = new TreeNode(arr[0]);
    let queue = [root];
    let i = 1;
    
    while (i < arr.length) {
        let current = queue.shift();
        
        if (arr[i] !== null) {
            current.left = new TreeNode(arr[i]);
            queue.push(current.left);
        }
        i++;
        
        if (i < arr.length && arr[i] !== null) {
            current.right = new TreeNode(arr[i]);
            queue.push(current.right);
        }
        i++;
    }
    
    return root;
}

let tree = {
    val: 3,
    left: {
        val: -1,
        left: {
            val: 1,
            left: {
                val: -1,
                left: {
                    val: 3,
                    left: null,
                    right: null
                },
                right: null
            },
            right: {
                val: -1,
                left: null,
                right: {
                    val: 8,
                    left: null,
                    right: null
                }
            }
        },
        right: null
    },
    right: {
        val: -1,
        left: null,
        right: {
            val: 7,
            left: null,
            right: {
                val: -1,
                left: null,
                right: {
                    val: 4,
                    left: null,
                    right: null
                }
            }
        }
    }
};

//         3
//        / \
//      -1   -1
//      /     \
//     1       7
//    / \       \
//  -1   -1      -1
//  /      \       \
// 3        8       4

// 示例使用
let arr = [3, -1, -1, 1, null, null, 7, -1, -1, null, -1, 3, null, null, 8, null, 4];
console.log(buildTree(arr));
console.log(11);
