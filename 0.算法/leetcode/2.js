// 链表两数相加  方鹏面百度被问
function ListNode(val, next) {
    this.val = (val === undefined ? 0 : val)
    this.next = (next === undefined ? null : next)
}

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

// 342 + 465 = 807

function add(l1, l2) {
    let addOne = 0 // 进位
    let sum = new ListNode(0)
    let head = sum
    while (addOne || l1 || l2) {
        let Val1 = l1 !== undefined ? l1.val : 0
        let Val2 = l2 !== undefined ? l2.val : 0
        let r = Val1 + Val2 + addOne
        addOne = r >= 10 ? 1 : 0
        sum.next = new ListNode(r % 10)
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

console.log(add(l1, l2)); // 807