// 给定一个二叉树和一个数字n,判断二叉树中是否有一个路径之和为 n   字节飞书一面

// n 为 22，二叉树的定义如下:
let tree = {
    val: 5,
    left: {
        val: 4,
        left: {
            val: 11,
            left: {
                val: 7
            },
            right: {
                val: 2
            }
        }
    },
    right: {
        val: 8,
        left: {
            val: 13,
            right: {
                val: 1
            }
        },
        right: {
            val: 4
        }
    }
}

//         5
//        / \
//       4   8
//      /   / \
//     11  13  4
//    /  \   \  17
//   7    2   1
//  27    22  27

function solution(root, num) {
    function dfs(root, res = 0) {
        if (!root) return false
        res += root.val
        if (!root.left && !root.right && res === num) {
            return true
        }
        return dfs(root.left, res) || dfs(root.right, res)
    }
    return dfs(root)
}

console.log(solution(tree, 22)); // true
console.log(solution(tree, 26)); // false
console.log(solution(tree, 18)); // false
console.log(solution(tree, 27)); // true
console.log(solution(tree, 5));  // false