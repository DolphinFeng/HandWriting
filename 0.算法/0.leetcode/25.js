// 25. K 个一组翻转链表

var reverseKGroup = function(head, k) {
    let cur = head;
    let count = 0;
    // 求k个待反转元素的首节点和尾节点
    while(cur != null && count != k){
        cur = cur.next;
        count++;
    }
    // 足够k个节点，去反转
    if(count == k){
        // 递归链接后续k个反转的链表头节点
        cur = reverseKGroup(cur,k);
        while(count != 0){
            count--;
            // 反转链表
            let tmp = head.next;
            head.next = cur;
            cur = head;
            head = tmp;
        }
        head = cur;
    }
    return head;
};

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

console.log(reverseKGroup(head, 2));
console.log(1111);
