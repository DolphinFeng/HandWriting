/**
 * 有一个函数，会判断有没有缓存，若没有，等待 timeout 后消费
 */

function consumeWithCache(key, timeout) {
    // 缓存对象
    const cache = {};

    // 模拟消费操作的函数
    function consume() {
        console.log(`Consuming data for key: ${key}`);
        // 这里可以添加实际的消费逻辑
    }

    // 判断是否有缓存
    if (cache[key]) {
        console.log(`Cache hit for key: ${key}`);
        return cache[key];
    } else {
        console.log(`Cache miss for key: ${key}. Waiting for ${timeout}ms to consume.`);
        setTimeout(() => {
            consume();
            // 模拟缓存数据
            cache[key] = `Data for key: ${key}`;
        }, timeout);
    }
}

// 示例用法:
consumeWithCache('exampleKey', 2000);
consumeWithCache('anotherKey', 1000);
consumeWithCache('exampleKey', 500); // 这个应该命中缓存
consumeWithCache('newKey', 3000);
consumeWithCache('anotherKey', 500); // 这个应该命中缓存