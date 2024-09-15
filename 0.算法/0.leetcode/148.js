// 链表排序

function ListNode(val, next) {
    this.val = (val===undefined ? 0 : val)
    this.next = (next===undefined ? null : next)
}

var sortList = function(head) {
    let res = []
    let cur = head
    while(cur != null){
        res.push(cur.val)
        cur = cur.next
    }
    res = res.sort((a, b) => a - b)

    if(res.length == 0){
        return null
    }
    let newHead = new ListNode(res[0])
    let newCur = newHead
    for(let i = 1; i<res.length; i++){
        newCur.next = new ListNode(res[i])
        newCur = newCur.next
    }
    return newHead
};

let head = {
    val: 4,
    next: {
        val: 2,
        next: {
            val: 1,
            next: {
                val: 3,
                next: null
            }
        }
    }
}

console.log(sortList(head));
console.log(1111);

