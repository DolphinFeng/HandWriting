/**
 * 记忆化函数，用于缓存函数的计算结果，避免重复计算
 * @param {Function} fn - 需要记忆化的函数
 * @returns {Function} - 记忆化后的函数
 */
function memoize(fn) {
    // 创建一个 Map 对象用于存储缓存
    const cache = new Map();
    
    // 返回一个新的函数，该函数会先检查缓存再调用原函数
    return function (...args) {
        // 将参数序列化为字符串作为缓存的键
        const key = JSON.stringify(args);
        
        // 如果缓存中存在该键，直接返回缓存的结果
        if (cache.has(key)) {
            return cache.get(key);
        }
        
        // 否则调用原函数计算结果
        const result = fn.apply(this, args);
        
        // 将计算结果存入缓存
        cache.set(key, result);
        
        // 返回计算结果
        return result;
    };
}

// 计算斐波那契数列的函数
function fibonacci(n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

// 使用记忆化函数包装斐波那契函数
const memoizedFibonacci = memoize(fibonacci);

// 测试未使用记忆化函数的情况
console.time('普通斐波那契');
console.log(fibonacci(35)); // 运行时间较长
console.timeEnd('普通斐波那契');

// 测试使用记忆化函数的情况
console.time('记忆化斐波那契');
console.log(memoizedFibonacci(35)); // 运行时间较短
console.timeEnd('记忆化斐波那契');

// 再次调用记忆化函数，测试缓存效果
console.time('记忆化斐波那契（缓存）');
console.log(memoizedFibonacci(35)); // 运行时间极短
console.timeEnd('记忆化斐波那契（缓存）');
