// 合并两个有序链表

function ListNode(val, next) {
    this.val = (val===undefined ? 0 : val)
    this.next = (next===undefined ? null : next)
}

function remergeTwoLists (list1, list2) {
    let head = new ListNode()
    let cur = head
    while (list1 && list2) {
        if (list1.val < list2.val) {
            cur.next = list1
            list1 = list1.next
        } else {
            cur.next = list2
            list2 = list2.next
        }
        cur = cur.next
    }

    cur.next = list1 == null ? list2 : list1

    return head.next
}

let l1 = {
    val: 1,
    next: {
        val: 2,
        next: {
            val: 4,
            next: null
        }
    }
}

let l2 = {
    val: 1,
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

console.log(remergeTwoLists(l1, l2));
console.log(11);
