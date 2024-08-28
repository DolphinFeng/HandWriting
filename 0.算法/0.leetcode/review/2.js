function ListNode(val, next) {
    this.val = (val === undefined ? 0 : val)
    this.next = (next === undefined ? null : next)
}

// 定义两个链表 l1 和 l2
let l1 = {
    val: 2,
    next: {
        val: 4,
        next: {
            val: 3,
            next: null
        }
    }
}

let l2 = {
    val: 5,
    next: {
        val: 6,
        next: {
            val: 4,
            next: null
        }
    }
}

function add (l1, l2) {
    let sum = new ListNode(0)
    let head = sum
    let addOne = 0
    while (addOne || l1 || l2) {
        let val1 = l1 ? l1.val : 0
        let val2 = l2 ? l2.val : 0
        let res = addOne + val1 + val2
        addOne = res >= 10 ? 1 : 0
        sum.next = new ListNode(res % 10)
        sum = sum.next
        if (l1) {
            l1 = l1.next
        }
        if (l2) {
            l2 = l2.next
        }
    }
    return head.next
}

console.log(add(l1, l2));
