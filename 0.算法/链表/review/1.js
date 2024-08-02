function ListNode(val, next) {
    this.val = (val === undefined ? 0 : val)
    this.next = (next === undefined ? null : next)
}

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

function reverse (head) {
    let prev = null, cur = head
    while (cur) {
        let nextNode = cur.next
        cur.next = prev
        prev = cur
        cur = nextNode
    }
    return prev
}

console.log(reverse(list));