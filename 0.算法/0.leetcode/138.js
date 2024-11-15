// 复制带随机指针的链表

const copyRandomList = head => {
    if (!head) return null;
    const m = new Map();
    let node = head;
    // 遍历旧节点，复制各节点值
    while (node) {
        m.set(node, new Node(node.val));
        node = node.next;
    }
    node = head;
    // 遍历旧节点，复制连接关系
    while (node) {
        m.get(node).next = node.next ? m.get(node.next) : null;
        m.get(node).random = node.random ? m.get(node.random) : null;
        node = node.next;
    }
    return m.get(head);
};

// test cases
function Node(val, next, random) {
    this.val = val;
    this.next = next;
    this.random = random;
}

// 构造测试用例
const node1 = new Node(7);
const node2 = new Node(13);
const node3 = new Node(11);
const node4 = new Node(10);
const node5 = new Node(1);

// 设置 next 指针
node1.next = node2;
node2.next = node3;
node3.next = node4;
node4.next = node5;
node5.next = null;

// 设置 random 指针
node1.random = null;
node2.random = node1;
node3.random = node5;
node4.random = node3;
node5.random = node1;

console.log(copyRandomList(node1));
console.log(copyRandomList(null)); // null
