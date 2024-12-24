// 链表快排序

function quickSort(head) {
    // 空链表或只有一个节点,直接返回
    if (!head || !head.next) return head;
    
    // 选择第一个节点作为基准值
    let pivot = head;
    let curr = head.next;
    
    // 存储小于和大于基准值的节点
    let smallHead = null, smallTail = null;
    let largeHead = null, largeTail = null;
    
    // 遍历链表,根据值的大小分成两个链表
    while (curr) {
        let next = curr.next;
        curr.next = null;
        
        if (curr.val < pivot.val) {
            if (!smallHead) {
                smallHead = smallTail = curr;
            } else {
                smallTail.next = curr;
                smallTail = curr;
            }
        } else {
            if (!largeHead) {
                largeHead = largeTail = curr;
            } else {
                largeTail.next = curr;
                largeTail = curr;
            }
        }
        curr = next;
    }
    
    // 递归排序左右两部分
    let left = quickSort(smallHead);
    let right = quickSort(largeHead);
    
    // 连接左中右三部分
    pivot.next = right;
    
    if (!left) return pivot;
    
    // 找到左边部分的尾节点
    let leftTail = left;
    while (leftTail.next) {
        leftTail = leftTail.next;
    }
    
    leftTail.next = pivot;
    return left;
}

// 测试用例
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
};

let sorted = quickSort(head);
let curr = sorted;
while (curr) {
    console.log(curr.val);
    curr = curr.next;
}
