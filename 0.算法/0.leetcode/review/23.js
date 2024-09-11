// 合并 K 个升序链表

/**
 * 定义链表节点构造函数
 * @param {number} val - 节点的值
 * @param {ListNode} next - 下一个节点的引用
 */
function ListNode(val, next) {
    this.val = (val === undefined ? 0 : val)
    this.next = (next === undefined ? null : next)
}

lists = [{
    val: 1,
    next: {
        val: 4,
        next: {
            val: 5,
            next: null
        }
    }
},{
    val: 1,
    next: {
        val: 3,
        next: {
            val: 4,
            next: null
        }
    }
},{
    val: 2,
    next: {
        val: 6,
        next: null
    }
}]

function mergeKLists (lists) {
    return lists.reduce((p, n) => {
        while (n) {
            p.push(n), n = n.next
        }
        return p
    },[]).sort((a, b) => a.val - b.val).reduceRight((p, n) => (n.next = p, p = n, p), null)
};

console.log(mergeKLists(lists));
