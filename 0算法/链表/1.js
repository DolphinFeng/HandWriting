// 反转链表
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
// 反转链表
var reverseList = function(head) {
    var prev = null, cur = head
    while(cur){
        // 双指针，原地反转链表
        const nextNode = cur.next // 存下一位，有个副本，不怕改原链表
        cur.next = prev // 让下一位指向prev 也就是null
        prev = cur // 下一位指向的就是1了，也就是2 -> 1
        cur = nextNode // 到下一次循环
    }
    return prev // 返回头节点
};
console.log(reverseList(list))