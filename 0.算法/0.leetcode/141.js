// 判断是否存在环形链表

function hasCycle (head) {
    let slow = head
    let fast = head
    while (fast && fast.next) {
        slow = slow.next
        fast = fast.next.next
        if (slow === fast) {
            return true
        }
    }
    return false
}

let head = {
    val: 3,
    next: {
        val: 2,
        next: {
            val: 0,
            next: {
                val: -4,
                next: null
            }
        }
    }
}

head.next.next.next.next = head.next;

console.log(hasCycle(head));