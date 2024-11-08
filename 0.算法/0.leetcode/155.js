// 最小栈
var MinStack = function () {
    // 主栈指针
    this.head = null
    // 辅助栈指针
    this.subHead = null
};

/** 
 * @param {number} x
 * @return {void}
 */
MinStack.prototype.push = function (x) {
    const newItem = {
        data: x,
        next: null
    }
    const subNewItem = {
        data: x,
        next: null
    }
    // 主栈判断逻辑
    if (!this.head) {
        this.head = newItem
    } else {
        newItem.next = this.head
        this.head = newItem
    }
    // 辅助栈判断逻辑
    if (!this.subHead) {
        this.subHead = subNewItem
    } else {
        if (this.subHead.data >= x) {
            subNewItem.next = this.subHead
            this.subHead = subNewItem
        }
    }
};

/**
 * @return {void}
 */
MinStack.prototype.pop = function () {
    if (!this.head) return false
    const result = this.head.data
    if (this.subHead && result === this.subHead.data) {
        this.subHead = this.subHead.next
    }
    this.head = this.head.next
    return result
};

/**
 * @return {number}
 */
MinStack.prototype.top = function () {
    if (!this.head) return false
    return this.head.data
};

/**
 * @return {number}
 */
MinStack.prototype.getMin = function () {
    if (!this.head || !this.subHead) return false
    return this.subHead.data
};

let  minStack = new MinStack();
minStack.push(-2);
minStack.push(0);
minStack.push(-3);
minStack.getMin();   // --> 返回 -3.
minStack.pop();
minStack.top();      // --> 返回 0.
minStack.getMin();   // --> 返回 -2.
