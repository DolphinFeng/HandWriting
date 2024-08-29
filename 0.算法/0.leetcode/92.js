// 反转链表 ii

// 给你单链表的头指针 head 和两个整数 left 和 right ，其中 left <= right 。请你反转从位置 left 到位置 right 的链表节点，返回 反转后的链表 。

// 示例 1：


// 输入：head = [1,2,3,4,5], left = 2, right = 4
// 输出：[1,4,3,2,5]
// 示例 2：

// 输入：head = [5], left = 1, right = 1
// 输出：[5]


function ListNode(val, next = null) {
    this.val = val;
    this.next = next;
}

var reverseBetween = function(head, m, n) {
    // 如果m === n 则直接返回
    if (m === n) return head;
    let total = n - m + 1;
    let count = 1;
    let length = 1;
    // 设置哑结点
    let newHead = new ListNode();
    newHead.next = head;
    let pre = newHead;
    // 遍历找到要反转的段的前一个节点
    while(length < m) {
        pre = pre.next;
        length++;
    }
    // 如果该节点没有next节点，则直接返回
    if (!pre.next) return newHead.next;
    // 常规双指针反转链表，终止条件是反转次数 大于等于 toatl
    let p = pre.next, q = p.next, pe = p;
    while(count < total) {
        const next = q.next;
        q.next = p;
        pe.next = next;
        p = q;
        q = next;
        count++;
    }
    // 将反转后的链表接上之前的链表
    pre.next = p;
    return newHead.next;
};


// 测试用例
let head = new ListNode(1, new ListNode(2, new ListNode(3, new ListNode(4, new ListNode(5)))));
let m = 2;
let n = 4;
let result = reverseBetween(head, m, n);

// 输出结果
while (result) {
    console.log(result.val);
    result = result.next;
}