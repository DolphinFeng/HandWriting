/**
 * 链表节点
 */
class Element {
    /**
     * 前一个节点(私有)
     * @type {Element}
     */
    _prev = null;
    /**
     * 下一个节点(私有)
     * @type{Element}
     */
    _next = null;
    /**
     * 节点值
     * @type{any}
     */
    val;

    /**
     * 前一个节点
     * @return {null|Element}
     */
    get prev() {
        let p = this._prev;
        if (p.list !== null && p !== this.list.root) {
            return p;
        }
        return null;
    }

    /**
     * 下一个节点
     * @return {null|Element}
     */
    get next() {
        let p = this._next;
        if (p.list !== null && p !== this.list.root) {
            return p;
        }
        return null;
    }


    /**
     * 所在链表
     * @type{List}
     */
    list;
    /**
     * @constructor
     * @param val{any}
     */
    constructor(val = null) {
        this.val = val;
    }
}

/**
 * 双向链表
 */
class List {
    root = new Element();
    len = 0;

    constructor() {
        return this.#init();
    }

    /**
     * 链表初始化
     * @return {List}
     */
    #init() {
        this.root._next = this.root;
        this.root._prev = this.root;
        return this;
    }

    /**
     * 返回第一个元素
     * @return{Element}
     */
    get front() {
        if (this.len === 0) {
            return null
        }
        return this.root._next;
    }

    /**
     * 返回最后一个元素
     * @return{Element}
     */
    get back() {
        if (this.len === 0) {
            return null
        }
        return this.root._prev;
    }

    /**
     * 初始化一个空链表
     */
    #lazyInit() {
        if (this.root._next === null) {
            this.#init();
        }
    }

    /**
     * 在at后面插入e
     * @param e{Element}
     * @param at{Element}
     */
    #insert(e, at) {
        e._prev = at;
        e._next = at._next;
        e._prev._next = e;
        e._next._prev = e;
        e.list = this;
        this.len++;
        return e;
    }

    /**
     * 在at后面插入一个值
     * @param v{any}
     * @param at{Element}
     * @return {Element}
     */
    #insertVal(v, at) {
        return this.#insert(new Element(v), at);
    }

    /**
     * 删除一个节点
     * @param e{Element}
     * @return{any}
     */
    remove(e) {
        if (e.list === this) {
            e._prev._next = e._next;
            e._next._prev = e._prev;
            e._next = null; //有助GC
            e._prev = null; //有助GC
            e.list = null; //有助GC
            this.len--;
        }
        return e.val;
    }

    /**
     * 将e移动到at后面
     * @param e{Element}
     * @param at{Element}
     */
    #move(e, at) {
        if (e === at) {
            return;
        }
        e._prev._next = e._next;
        e._next._prev = e._prev;
        e._prev = at;
        e._next = at._next;
        e._prev._next = e;
        e._next._prev = e;
    }

    /**
     * 往链头插入一个元素
     * @param v{any}
     * @return {Element}
     */
    pushFront(v) {
        this.#lazyInit();
        return this.#insertVal(v, this.root);
    }

    /**
     * 往链尾插入一个元素
     * @param v{any}
     * @return {Element}
     */
    pushBack(v) {
        this.#lazyInit();
        return this.#insertVal(v, this.root._prev);
    }

    /**
     * 在mark前面插入一个值
     * @param v{any}
     * @param mark{Element}
     * @return {null|Element}
     */
    insertBefore(v, mark) {
        if (mark.list !== this) {
            return null;
        }
        return this.#insertVal(v, mark._prev);
    }

    /**
     * 在mark后面插入一个值
     * @param v{any}
     * @param mark{Element}
     * @return {null|Element}
     */
    insertAfter(v, mark) {
        if (mark.list !== this) {
            return null;
        }
        return this.#insertVal(v, mark);
    }

    /**
     * 将元素移动到最前面
     * @param e{Element}
     */
     moveToFront(e) {
        if (e.list !== this || this.root._next === e) {
            return;
        }
        this.#move(e, this.root);
     }

    /**
     * 将元素移动到尾部
     * @param e{Element}
     */
    moveToBack(e) {
        if (e.list !== this || this.root._prev === e) {
            return;
        }
        this.#move(e, this.root._prev);
    }

    /**
     * 将元素移动到mark前面
     * @param e{Element}
     * @param mark{Element}
     */
    moveBefore(e, mark) {
        if (e.list !== this || e === mark || mark.list !== this) {
            return;
        }
        this.#move(e, mark._prev);
    }

    /**
     * 将元素移动到mark后面
     * @param e{Element}
     * @param mark{Element}
     */
    moveAfter(e, mark) {
        if (e.list !== this || e === mark || mark.list !== this) {
            return;
        }
        this.#move(e, mark);
    }

    /**
     * 连接一条其他链表到链表尾
     * @param other{List}
     */
    pushBackList(other) {
        this.#lazyInit();
        for (let i = other.len, e = other.front; i > 0;) {
            this.#insertVal(e.val, this.root._prev);
            i--;
            e = e.next;
        }
    }

    /**
     * 连接一条其他链表到链表头
     * @param other{List}
     */
    pushFrontList(other) {
        this.#lazyInit();
        for (let i = other.len, e = other.back; i > 0;) {
            this.#insertVal(e.val, this.root);
            i--;
            e = e.prev;
        }
    }
}

/**
 * 创建链表
 * @returns {List}
 * @constructor
 */
function NewList() {
    return new List();
}

export {NewList, Element, List}
