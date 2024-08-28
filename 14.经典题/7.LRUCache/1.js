// LRU 缓存   U 神腾讯一面拿下

// 请你设计并实现一个满足  LRU (最近最少使用) 缓存 约束的数据结构。
// 实现 LRUCache 类：
// LRUCache(int capacity) 以 正整数 作为容量 capacity 初始化 LRU 缓存
// int get(int key) 如果关键字 key 存在于缓存中，则返回关键字的值，否则返回 -1 。
// void put(int key, int value) 如果关键字 key 已经存在，则变更其数据值 value ；如果不存在，则向缓存中插入该组 key-value 。如果插入操作导致关键字数量超过 capacity ，则应该 逐出 最久未使用的关键字。
// 函数 get 和 put 必须以 O(1) 的平均时间复杂度运行。

// 示例：

// 输入
// ["LRUCache", "put", "put", "get", "put", "get", "put", "get", "get", "get"]
// [[2], [1, 1], [2, 2], [1], [3, 3], [2], [4, 4], [1], [3], [4]]
// 输出
// [null, null, null, 1, null, -1, null, -1, 3, 4]

// 解释
// LRUCache lRUCache = new LRUCache(2);
// lRUCache.put(1, 1); // 缓存是 {1=1}
// lRUCache.put(2, 2); // 缓存是 {1=1, 2=2}
// lRUCache.get(1);    // 返回 1
// lRUCache.put(3, 3); // 该操作会使得关键字 2 作废，缓存是 {1=1, 3=3}
// lRUCache.get(2);    // 返回 -1 (未找到)
// lRUCache.put(4, 4); // 该操作会使得关键字 1 作废，缓存是 {4=4, 3=3}
// lRUCache.get(1);    // 返回 -1 (未找到)
// lRUCache.get(3);    // 返回 3
// lRUCache.get(4);    // 返回 4
 


class LRUCache {
    constructor(capacity) {
        this.capacity = capacity;
        this.cache = new Map();
    }

    get(key) {
        if (!this.cache.has(key)) {
            return -1;
        }
        const value = this.cache.get(key);
        this.cache.delete(key);
        this.cache.set(key, value);
        return value;
    }

    put(key, value) {
        if (this.cache.has(key)) {
            this.cache.delete(key);
        } else if (this.cache.size >= this.capacity) {
            const firstKey = this.cache.keys().next().value; // this.cache.keys(): 返回一个包含 Map 中所有 key 的迭代器。next 就是迭代起的下一个结果对象，有 value 和 done 属性
            this.cache.delete(firstKey);
        }
        this.cache.set(key, value);
    }
}


// 创建一个容量为2的LRU缓存
const lRUCache = new LRUCache(2);

// 插入键值对 (1, 1)
lRUCache.put(1, 1); // 缓存是 {1=1}

// 插入键值对 (2, 2)
lRUCache.put(2, 2); // 缓存是 {1=1, 2=2}

// 获取键 1 的值
console.log(lRUCache.get(1));    // 返回 1，缓存更新为 {2=2, 1=1}

// 插入键值对 (3, 3)，导致键 2 被移除
lRUCache.put(3, 3); // 缓存是 {1=1, 3=3}

// 获取键 2 的值
console.log(lRUCache.get(2));    // 返回 -1 (未找到)

// 插入键值对 (4, 4)，导致键 1 被移除
lRUCache.put(4, 4); // 缓存是 {3=3, 4=4}

// 获取键 1 的值
console.log(lRUCache.get(1));    // 返回 -1 (未找到)

// 获取键 3 的值
console.log(lRUCache.get(3));    // 返回 3

// 获取键 4 的值
console.log(lRUCache.get(4));    // 返回 4
