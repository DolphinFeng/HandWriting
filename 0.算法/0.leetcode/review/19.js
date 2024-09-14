// 删除链表的倒数第 N 个结点

function ListNode(val, next) {
    this.val = (val===undefined ? 0 : val)
    this.next = (next===undefined ? null : next)
}

function removeNthFromEnd (head, n) {
    let dummy = new ListNode()
    dummy.next = head
    let slow = dummy
    let fast = dummy
    while (n !== 0) {
        fast = fast.next
        n--
    }
    while (fast.next) {
        fast = fast.next
        slow = slow.next
    }
    slow.next = slow.next.next
    return dummy.next
}

let head = {
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

console.log(removeNthFromEnd(head, 2)); // 1 -> 2 -> 3 -> 5
console.log(11);
