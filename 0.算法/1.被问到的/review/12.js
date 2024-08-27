// 反转链表 leetcode206
/**
 * 定义链表节点构造函数
 * @param {number} val - 节点的值
 * @param {ListNode} next - 下一个节点的引用
 */
function ListNode(val, next) {
    this.val = (val === undefined ? 0 : val)
    this.next = (next === undefined ? null : next)
}

// 示例链表
let list = {
    val: 1, 
    next: {
        val: 2, 
        next: {
            val: 3, 
            next: {
                val: 4, 
                next: {
                    val: 5, 
                    next: null
                }
            }
        }
    }
}

function reverseList (node) {
    let prev = null, cur = node
    while (cur) {
        const next = cur.next
        cur.next = prev
        prev = cur
        cur = next
    }
    return prev
}

console.log(reverseList(list))