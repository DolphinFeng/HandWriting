// 删除有序链表中的重复元素

function deleteDuplicates (head) {
    let cur = head
    while (cur !== null && cur.next !== null) {
        if (cur.val === cur.next.val) {
            cur.next = cur.next.next
        } else {
            cur = cur.next
        }
    }
    return head
}


let head = {
    val: 1,
    next: {
        val: 1,
        next: {
            val: 2,
            next: {
                val: 3,
                next: {
                    val: 3,
                    next: null
                }
            }
        }
    }
}

console.log(deleteDuplicates(head));
console.log(11);
