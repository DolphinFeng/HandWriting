// 两数两加

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

function add (v1, v2) {
    let sum = new ListNode(0)
    let head = sum
    let addOne = 0
    while (addOne || v1 || v2) {
        let val1 = v1 !== undefined ? v1.val : 0
        let val2 = v2 !== undefined ? v2.val : 0
        let r = val1 + val2 + addOne
        addOne = r >= 10 ? 1 : 0
        sum.next = new ListNode(r % 10)
        sum = sum.next
        if (v1) {
            v1 = v1.next
        }
        if (v2) {
            v2 = v2.next
        }
    }
    return head.next
}

console.log(add(l1, l2));

