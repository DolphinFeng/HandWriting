/** 双向链表 */
class ListNode {
    pre = null;
    next = null;
    val;
    /**
     * @constructor
     * @param val
     */
    constructor(val = null) {
        this.val = val;
    }
}

/** 操作历史栈:双向链表 */
export class OpHistory {
    head = new ListNode();
    tail = new ListNode();
    cur = new ListNode();
    constructor() {
        this.head.next = this.tail;
        this.cur = this.tail;
        this.tail.pre = this.head;
    }

    push(record) {
        let node = new ListNode(record);
        this.cur.pre.next = node;
        node.pre = this.cur.pre;
        node.next = this.tail;
        this.tail.pre = node;
        if (this.cur !== this.tail) {
            this.cur = this.tail;
        }
    }

    clear() {
        if (this.head.next !== this.tail) {
            this.cur = this.tail;
            this.head.next = this.tail;
            this.tail.pre = this.head;
        }
    }

    back() {
        if (this.cur.pre === this.head) {
            return null;
        }
        return (this.cur = this.cur.pre).val;
    }

    forward() {
        if (this.cur === this.tail) {
            return null;
        }
        return (this.cur = this.cur.next).pre.val;
    }

    get list() {
        let p = this.head.next, res = [];
        while (p !== this.cur) {
            res.push(p.val);
            p = p.next;
        }
        return res;
    }

    print() {
        let p = this.head.next, i = 0, cur;
        while (p !== this.tail) {
            if (p === this.cur) {
                cur = i;
            }
            console.log(++i, p.val);
            p = p.next;
        }
        if (cur === undefined) {
            cur = i;
        }
        console.log('当前', cur);
    }
}
