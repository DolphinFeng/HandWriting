// 反转链表 leetcode206
/**
 * 定义链表节点构造函数
 * @param {number} val - 节点的值
 * @param {ListNode} next - 下一个节点的引用
 */
function ListNode(val, next) {
    this.val = (val === undefined ? 0 : val)
    this.next = (next === undefined ? null : next)
}

// 示例链表
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

/**
 * 反转链表
 * @param {ListNode} head - 链表的头节点
 * @return {ListNode} - 反转后的链表头节点
 */
var reverseList = function(head) {
    var prev = null, cur = head // 初始化前一个节点为null，当前节点为头节点
    while(cur){
        const next = cur.next // 暂存当前节点的下一个节点
        cur.next = prev // 将当前节点的next指向前一个节点，实现反转
        prev = cur // 前一个节点移动到当前节点
        cur = next // 当前节点移动到下一个节点
    }
    return prev // 返回反转后的链表头节点
};


console.log(reverseList(list))