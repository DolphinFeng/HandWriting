// 链表两数相加  方鹏面百度被问
/**
 * 定义链表节点构造函数
 * @param {number} val - 节点的值
 * @param {ListNode} next - 下一个节点的引用
 */
function ListNode(val, next) {
    this.val = (val === undefined ? 0 : val)
    this.next = (next === undefined ? null : next)
}

// 定义两个链表 l1 和 l2
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

/**
 * 将两个链表表示的数字相加，并返回一个新的链表表示结果
 * @param {ListNode} l1 - 第一个链表
 * @param {ListNode} l2 - 第二个链表
 * @returns {ListNode} - 相加后的结果链表
 */
function add(l1, l2) {
    let addOne = 0 // 进位
    let sum = new ListNode(0) // 初始化结果链表
    let head = sum // 保存结果链表的头节点

    // 当有进位或任一链表未遍历完时，继续循环
    while (addOne || l1 || l2) {
        // 获取当前节点的值，若节点不存在则为0
        let Val1 = l1 !== undefined ? l1.val : 0
        let Val2 = l2 !== undefined ? l2.val : 0

        // 计算当前位的和及进位
        let r = Val1 + Val2 + addOne
        addOne = r >= 10 ? 1 : 0

        // 创建新节点保存当前位的结果
        sum.next = new ListNode(r % 10)
        sum = sum.next

        // 移动到下一个节点
        if (l1) {
            l1 = l1.next
        }
        if (l2) {
            l2 = l2.next
        }
    }
    return head.next // 返回结果链表的头节点
}

// 打印相加后的结果链表
console.log(add(l1, l2)); // 807
