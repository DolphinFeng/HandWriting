// 反转链表

/**
 * 定义链表节点构造函数
 * @param {number} val - 节点的值
 * @param {ListNode} next - 下一个节点的引用
 */
function ListNode(val, next) {
    this.val = (val === undefined ? 0 : val)
    this.next = (next === undefined ? null : next)
}

function reverseList(head) {
    let prev = null, cur = head
    while(cur){
        const next = cur.next
        cur.next = prev
        prev = cur
        cur = next
    }
    return prev
}

let l1 = {
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

console.log(reverseList(l1));
