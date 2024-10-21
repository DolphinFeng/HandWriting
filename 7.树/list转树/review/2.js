function TreeNode (val) {
    this.val = val;
    this.left = null;
    this.right = null;
}


function buildTree (arr) {
    if (arr.length === 0) return null

    let root = new TreeNode(arr[0])

    let queue = [root], i = 1

    while (i < arr.length) {
        let cur = queue.shift()

        if (arr[i] !== null) {
            cur.left = new TreeNode(arr[i])
            queue.push(cur.left)
        }
        i++
        if (i < arr.length && arr[i] !== null) {
            cur.right = new TreeNode(arr[i])
            queue.push(cur.right)
        }
        i++
    }
    
    return root
}


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